// ==UserScript==
// @name        Coletor Automático ~ CBN
// @version     0.4.0
// @description Coleta automaticamente recursos, com opção de coletar em mais de uma aldeia e desbloquear automaticamente as coletas
// @author      CBN
// @include     http*://*.*&mode=scavenge*
// @require     https://code.jquery.com/jquery-3.7.0.min.js
// @grant       GM_addStyle
// @grant       unsafeWindow
// ==/UserScript==
const scriptStorage = "CBN_automatic_scavenge"
const mockStorage = {
  troops: [
    {
      name: "spear",
      scavenge: false,
    },
    {
      name: "sword",
      scavenge: false,
    },
    {
      name: "axe",
      scavenge: false,
    },
    {
      name: "archer",
      scavenge: false,
    },
    {
      name: "light",
      scavenge: false,
    },
    {
      name: "marcher",
      scavenge: false,
    },
    {
      name: "heavy",
      scavenge: false,
    },
  ],
  preferences: {
    script_status: false,
    max_hours: 0,
    multiple_villages: false,
    unlock_scavenge: false,
  },
}
const storage = scriptStorage in localStorage ? localStorage.getItem(scriptStorage) : mockStorage
const lockedScavenges = document.querySelectorAll(".lock").length
const scavenges = {
  locked: lockedScavenges,
  unlocked: 4 - lockedScavenges,
}

const genericFunctions = {
  captchaFinder: () => {
    // if (true) {
    //   alert("Captcha encontrado, o script será pausado até ser resolvido para evitar banimentos.")
    // }
  },
  generateRandomNumber: (min, max) => {
    return Math.round(min + Math.random() * (max - min))
  },
  formatDateHour: (dataHora) => {
    const data = new Date(dataHora)
    const dia = ("0" + data.getDate()).slice(-2)
    const mes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][data.getMonth()]
    const ano = data.getFullYear()
    const horas = ("0" + data.getHours()).slice(-2)
    const minutos = ("0" + data.getMinutes()).slice(-2)
    const segundos = ("0" + data.getSeconds()).slice(-2)
    const milissegundos = ("00" + data.getMilliseconds()).slice(-3)

    return `${dia} ${mes} ${ano}, ${horas}:${minutos}:${segundos}:${milissegundos}`
  },
  saveStorage: () => {
    genericFunctions.log(`Salvando no banco: ${genericFunctions.formatDateHour(Date.now())}`)
    localStorage.setItem(scriptStorage, JSON.stringify(storage))
  },
  log: (log) => {
    console.log("[LOG]", log)
  },
}
const UIfunctions = {
  createUI: () => {
    GM_addStyle(`
      .h5CBN {
        padding: 0;
        margin: 0;
        cursor: default;
      }
      
      /* BOTÃO DE MENU */
      #menuCBN {
        z-index: 999999;
        position: fixed;
        bottom: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        margin: 0 0 10px 10px;
        cursor: pointer;
        background-color: #d2c09e;
        box-shadow: inset 0 3px rgba(255, 255, 255, 0.4), inset 0 -5px rgba(0, 0, 0, 0.05), inset 0 -30px rgba(0, 0, 0, 0.01), inset 0 -1px rgba(0, 0, 0, 0.15), 0 4px rgba(0, 0, 0, 0.05);
        border: 1px solid black;
        border-radius: 999px;
        transition: ease 0.3s;
      }
      
      #menuCBN:hover {
        background-color: #7e7460;
      }
      
      /* MODAL */
      .modal-containerCBN {
        z-index: 999999;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity ease 0.3s;
      }
      
      .modal {
        z-index: 999999;
        width: 360px;
        padding: 20px;
        background-color: #d2c09e;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        opacity: 0;
        border-radius: 5px;
        transform: scale(0.8);
        transition: opacity ease 0.3s, transform ease 0.3s;
      }
      
      .modal-containerCBN.active {
        opacity: 1;
        pointer-events: auto;
      }
      
      .modal.active {
        opacity: 1;
        transform: scale(1);
      }
      
      .modal-close {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
      }
      
      /* SLIDER */
      .script-title {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      
      .toggle {
        position: relative;
        display: inline-block;
        width: 26px;
        height: 14px;
        margin-left: 6px;
      }
      
      .toggle input[type="checkbox"] {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #9b9b9b;
        transition: 0.4s;
        border-radius: 7px;
      }
      
      .slider:before {
        position: absolute;
        content: "";
        height: 10px;
        width: 10px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
      }
      
      input[type="checkbox"]:checked + .slider {
        background-color: #1bc74e;
      }
      
      input[type="checkbox"]:checked + .slider:before {
        transform: translateX(12px);
      }
      
      .footerCBN {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        cursor: default;
      }
      
      .label-float {
        position: relative;
        padding-top: 13px;
      }
      
      .label-float input {
        background-color: #d2c09e;
        border: 1px solid #c89d58;
        border-radius: 5px;
        outline: none;
        min-width: 250px;
        padding: 10px;
        font-size: 12px;
        transition: all 0.1s linear;
        -webkit-transition: all 0.1s linear;
        -moz-transition: all 0.1s linear;
        -webkit-appearance: none;
      }
      
      .label-float input:focus {
        border: 2px solid #85550d;
      }
      
      .label-float input::placeholder {
        color: transparent;
      }
      
      .label-float input:required:invalid + label {
        color: red;
      }
      .label-float input:focus:required:invalid {
        border: 2px solid red;
      }
      .label-float input:required:invalid + label:before {
        content: "*";
      }
      .label-float input:focus + label,
      .label-float input:not(:placeholder-shown) + label {
        font-size: 13px;
        top: 0;
        color: #85550d;
      }
      
      .label-float label {
        pointer-events: none;
        position: absolute;
        top: calc(50% - 8px);
        left: 15px;
        transition: all 0.1s linear;
        -webkit-transition: all 0.1s linear;
        -moz-transition: all 0.1s linear;
        background-color: #d2c09e;
        color: #85550d;
        padding: 5px;
        box-sizing: border-box;
      }
    `)

    function createModal() {
      const modalContainer = document.createElement("div")
      modalContainer.classList.add("modal-containerCBN")

      const modal = document.createElement("div")
      modal.classList.add("modal")

      const modalCloseButton = document.createElement("span")
      modalCloseButton.classList.add("modal-close")
      modalCloseButton.innerHTML = `<img src="https://img.icons8.com/?size=20&id=13903&format=png" title="Fechar modal" />`
      modalCloseButton.addEventListener("click", closeModal)
      modal.appendChild(modalCloseButton)

      const modalContent = document.createElement("div")
      modalContent.classList.add("modal-content")

      const section = document.createElement("section")
      section.classList.add("sectionCBN")
      section.innerHTML = `
      <div class="script-title">
        <h5 class="h5CBN">COLETOR AUTOMÁTICO</h5>
        <label class="toggle">
          <input type="checkbox" id="start-script" />
          <span class="slider"></span>
        </label>
      </div>
      <hr />
      <div id="scavenge-troops">
        <table class="tabela-coleta" width="100%" style="border: 7px solid rgba(121, 0, 0, 0.71);border-image-slice: 7 7 7 7;border-image-source: url(https://dsen.innogamescdn.com/asset/cf2959e7/graphic/border/frame-gold-red.png);">
          <tbody>
            <tr>
              <th style="text-align: center" colspan="8">Selecione as tropas que irão coletar</th>
            </tr>
            <tr>
              <th style="text-align: center" width="35">
                <a href="#" class="unit_link" data-unit="spear">
                  <img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_spear.png" title="Lanceiro" />
                </a>
              </th>
              <th style="text-align: center" width="35">
                <a href="#" class="unit_link" data-unit="sword">
                  <img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_sword.png" title="Espadachim" />
                </a>
              </th>
              <th style="text-align: center" width="35">
                <a href="#" class="unit_link" data-unit="axe">
                  <img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_axe.png" title="Bárbaro" />
                </a>
              </th>
              ${
                document.querySelector(".units-entry-all[data-unit=archer]").textContent != "" &&
                `<th style="text-align: center" width="35">
                    <a href="#" cl ass="unit_link" data-unit="archer">
                      <img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_archer.png" title="Arqueiro" />
                    </a>
                  </th>`
              }
              <th style="text-align: center" width="35">
                <a href="#" class="unit_link" data-unit="light">
                  <img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_light.png" title="Cavalaria leve" />
                </a>
              </th>
              ${
                document.querySelector(".units-entry-all[data-unit=archer]").textContent != "" &&
                `<th style="text-align: center" width="35">
                    <a href="#" class="unit_link" data-unit="marcher">
                      <img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_marcher.png" title="Arqueiro a cavalo" />
                    </a>
                  </th>`
              }
              <th style="text-align: center" width="35">
                <a href="#" class="unit_link" data-unit="heavy">
                  <img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_heavy.png" title="Cavalaria pesada" />
                </a>
              </th>
            </tr>
            <tr>
              <td align="center">
                <label class="toggle">
                  <input type="checkbox" id="spear" />
                  <span class="slider"></span>
                </label>
              </td>
              <td align="center">
                <label class="toggle">
                  <input type="checkbox" id="sword" />
                  <span class="slider"></span>
                </label>
              </td>
              <td align="center">
                <label class="toggle">
                  <input type="checkbox" id="axe" />
                  <span class="slider"></span>
                </label>
              </td>
              ${
                document.querySelector(".units-entry-all[data-unit=archer]").textContent != "" &&
                `<td align="center">
                  <label class="toggle">
                    <input type="checkbox" id="archer" />
                    <span class="slider"></span>
                  </label>
                </td>`
              }
              <td align="center">
                <label class="toggle">
                  <input type="checkbox" id="light" />
                  <span class="slider"></span>
                </label>
              </td>
              ${
                document.querySelector(".units-entry-all[data-unit=marcher]").textContent != "" &&
                `<td align="center">
                  <label class="toggle">
                    <input type="checkbox" id="marcher" />
                    <span class="slider"></span>
                  </label>
                </td>`
              }
              <td align="center">
                <label class="toggle">
                  <input type="checkbox" id="heavy" />
                  <span class="slider"></span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
        <br />
      </div>
      <div class="label-float">
        <input type="number" placeholder=" " id="horas" size="2" maxlength="2" value="${storage.preferences.max_hours}" />
        <label>Horas máximas coletando</label>
      </div>
      <small style="cursor: default">Coloque 0 para enviar todas as tropas disponíveis</small>
      <div style="display: flex; flex-direction: row; margin-top: 15px">
        <p style="font-weight: 600; cursor: default;">Aldeia única</p>
        <label class="toggle">
          <input type="checkbox" id="multiple-villages" />
          <span class="slider"></span>
        </label>
      </div>
      <div style="display: flex; flex-direction: row; margin-top: 5px">
        <p style="font-weight: 600; cursor: default;">Desbloquear coletas</p>
        <label class="toggle">
          <input type="checkbox" id="unlock-scavenge" />
          <span class="slider"></span>
        </label>
      </div>
    `
      modalContent.appendChild(section)
      modal.appendChild(modalContent)
      modalContainer.appendChild(modal)

      const modalFooter = document.createElement("footer")
      modalFooter.classList.add("footerCBN")
      modalFooter.innerHTML = `
        <a class="btn" id="save-preferences">Salvar preferências</a>
        <div>
          <img src="https://img.icons8.com/?size=15&id=19294&format=png" title="Desenvolvido" />
          <i>Desenvolvido por CBN</i>
        </div>
      `
      modal.appendChild(modalFooter)

      document.body.appendChild(modalContainer)
    }

    function openModal() {
      const modalContainer = document.querySelector(".modal-containerCBN")
      const modal = document.querySelector(".modal")
      modalContainer.classList.add("active")
      modal.classList.add("active")
    }

    function closeModal() {
      const modalContainer = document.querySelector(".modal-containerCBN")
      const modal = document.querySelector(".modal")
      modalContainer.classList.remove("active")
      modal.classList.remove("active")
    }

    const body = document.querySelector("body")

    const menu = document.createElement("div")
    menu.id = "menuCBN"
    menu.innerHTML = `<div><img src="https://img.icons8.com/?size=25&id=13118&format=png" alt="Menu do script" /></div>`
    body.appendChild(menu)

    createModal()

    const modalButton = document.querySelector("#menuCBN")
    modalButton.addEventListener("click", openModal)
    document.addEventListener("click", (event) => {
      if (event.target.classList.contains("modal-containerCBN")) closeModal()
    })
  },
}

function typing(input, valor) {
  input.dispatchEvent(new Event("focus"))
  input.dispatchEvent(new KeyboardEvent("keydown"))
  input.value = valor
  input.dispatchEvent(new KeyboardEvent("keyup"))
  input.dispatchEvent(new Event("change"))
}

function separateTroops(max_hours) {
  const separatedTroops = []

  if (max_hours > 0) {
  } else {
    storage.troops.forEach((troop) => {
      if (troop.scavenge) {
        const units = document.querySelector(`.units-entry-all[data-unit="${troop.name}"]`)
        const quantity = parseInt(units.textContent.replace("(", "").replace(")", ""))

        switch (scavenges.unlocked) {
          case 1:
            separatedTroops.push({
              troop: troop.name,
              quantity: [Math.floor(quantity), 0, 0, 0],
            })
            break
          case 2:
            separatedTroops.push({
              troop: troop.name,
              quantity: [Math.floor(quantity * 0.714), Math.floor(quantity * 0.286), 0, 0],
            })
            break
          case 3:
            separatedTroops.push({
              troop: troop.name,
              quantity: [Math.floor(quantity * 0.625), Math.floor(quantity * 0.25), Math.floor(quantity * 0.125), 0],
            })
            break
          case 4:
            separatedTroops.push({
              troop: troop.name,
              quantity: [Math.floor(quantity * 0.577), Math.floor(quantity * 0.231), Math.floor(quantity * 0.115), Math.floor(quantity * 0.077)],
            })
            break
          default:
            UI.ErrorMessage("Erro na separação das tropas, entre em contato com o desenvolvedor.")
            break
        }
      }
    })
  }

  return separatedTroops
}

function startScavenging(scavengingTroops) {
  const btnSendScavenge = document.querySelectorAll(".free_send_button")
  const inputScavenge = document.querySelector(".return-countdown")

  setInterval(() => {
    genericFunctions.log(`Fazendo conferência de requisitos: ${genericFunctions.formatDateHour(Date.now())}`)

    if (!inputScavenge) {
      for (let scavengeLevel = 0; scavengeLevel < coletas.coletasDesbloqueadas; scavengeLevel++) {
        scavengingTroops.forEach((troop) => {
          const input = document.querySelector(`input[name="${troop.name}"]`)
          digitar(input, troop.quantity[scavengeLevel])
        })

        setTimeout(() => btnSendScavenge[scavengeLevel].click(), genericFunctions.generateRandomNumber(1000, 3000))
      }
    }
  }, genericFunctions.generateRandomNumber(40000, 60000))
}

function startScript() {
  if (document.querySelector("input#start-script").checked) {
    const scavengingTroops = separateTroops(storage.preferences.max_hours)

    startScavenging(scavengingTroops)
  }
}

$(document).ready(() => {
  UIfunctions.createUI()
  startScript()

  const checkbox = document.querySelector("input#spear")
  checkbox.addEventListener("change", () => {
    console.log("Checkbox :>>", checkbox.checked)
    UI.SuccessMessage("Alterações no script feitas com sucesso!")
  })
})
