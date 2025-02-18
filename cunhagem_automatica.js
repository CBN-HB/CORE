// ==UserScript==
// @name        Cunhagem Automática ~ CBN
// @version     1.1.0
// @description Cunha automaticamente todas as moedas possíveis da aldeia dentro de um tempo pré-selecionado
// @author      CBN
// @include     http*://*.*screen=snob*
// @require     https://code.jquery.com/jquery-3.7.0.min.js
// @grant       GM_addStyle
// ==/UserScript==
const objPreferencias = {
  tempo: 30,
  status_cunhagem: false,
}
const mockStorage = {
  preferencias: objPreferencias,
}
const storageCunhagem = localStorage.getItem("onis_cunhagem_automatica")
const storage = storageCunhagem ? JSON.parse(storageCunhagem) : mockStorage

function criarBotao(texto, id) {
  const botao = document.createElement("a")
  botao.classList = "btn"
  botao.id = id
  botao.style.margin = "3px 0"
  botao.textContent = texto

  return botao
}

function createUI() {
  GM_addStyle(`
  .h5Onis {
    padding: 0;
    margin: 0;
    cursor: default;
  }
  
  /* BOTÃO DE MENU */
  #menuOnis {
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
  
  #menuOnis:hover {
    background-color: #7e7460;
  }
  
  /* MODAL */
  .modal-containerOnis {
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
  
  .modal-containerOnis.active {
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
  
  .footerOnis {
    display: flex;
    justify-content: end;
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
    modalContainer.classList.add("modal-containerOnis")

    const modal = document.createElement("div")
    modal.classList.add("modal")

    const modalCloseButton = document.createElement("span")
    modalCloseButton.classList.add("modal-close")
    modalCloseButton.innerHTML = '<img src="https://img.icons8.com/?size=20&id=13903&format=png" alt="Fechar modal" />'
    modalCloseButton.addEventListener("click", closeModal)
    modal.appendChild(modalCloseButton)

    const modalContent = document.createElement("div")
    modalContent.classList.add("modal-content")

    const section = document.createElement("section")
    section.classList.add("sectionOnis")
    section.innerHTML = `
      <div class="script-title">
        <h5 class="h5Onis">NOME DO SCRIPT</h5>
        <label class="toggle">
          <input type="checkbox" id="classe-do-script" />
          <span class="slider"></span>
        </label>
      </div>
      <hr />
      <div class="label-float">
        <input type="number" id="tempo_cunhagem" min="5" value="${storage.preferencias.tempo}" placeholder=" " />
        <label>Tempo (em segundos) entre cunhagens</label>
      </div>
    `
    modalContent.appendChild(section)
    modal.appendChild(modalContent)
    modalContainer.appendChild(modal)

    const modalFooter = document.createElement("footer")
    modalFooter.classList.add("footerOnis")
    const footerImage = document.createElement("img")
    footerImage.src = "https://img.icons8.com/?size=15&id=19294&format=png"
    footerImage.style.paddingRight = "3px"
    const footerText = document.createElement("i")
    footerText.textContent = "Desenvolvido por Onis"
    modalFooter.appendChild(footerImage)
    modalFooter.appendChild(footerText)
    modal.appendChild(modalFooter)

    document.body.appendChild(modalContainer)
  }

  function openModal() {
    const modalContainer = document.querySelector(".modal-containerOnis")
    const modal = document.querySelector(".modal")
    modalContainer.classList.add("active")
    modal.classList.add("active")
  }

  function closeModal() {
    const modalContainer = document.querySelector(".modal-containerOnis")
    const modal = document.querySelector(".modal")
    modalContainer.classList.remove("active")
    modal.classList.remove("active")
  }

  const body = document.querySelector("body")

  const menu = document.createElement("div")
  menu.id = "menuOnis"
  menu.innerHTML = '<div><img src="https://img.icons8.com/?size=25&id=13118&format=png" alt="Menu do script" /></div>'
  body.appendChild(menu)

  createModal()

  const modalButton = document.querySelector("#menuOnis")
  modalButton.addEventListener("click", openModal)
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-containerOnis")) closeModal()
  })
}

function numeroAleatorio(min, max) {
  return Math.round(min + Math.random() * (max - min))
}

function formatarDataHora(dataHora) {
  const data = new Date(dataHora)
  const dia = ("0" + data.getDate()).slice(-2)
  const mes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][data.getMonth()]
  const ano = data.getFullYear()
  const horas = ("0" + data.getHours()).slice(-2)
  const minutos = ("0" + data.getMinutes()).slice(-2)
  const segundos = ("0" + data.getSeconds()).slice(-2)
  const milissegundos = ("00" + data.getMilliseconds()).slice(-3)

  return `${dia} ${mes} ${ano}, ${horas}:${minutos}:${segundos}:${milissegundos}`
}

function salvarStorage() {
  console.log("[LOG]", "Salvando preferências:", formatarDataHora(Date.now()))
  localStorage.setItem("onis_cunhagem_automatica", JSON.stringify(storage))
  criarToast("Alterações no script feitas com sucesso!", 1)
}

function iniciarScript() {
  if (storage.preferencias.status_cunhagem) {
    const botaoCunhagem = document.querySelector('input[value="Cunhar"]') ? document.querySelector('input[value="Cunhar"]') : null
    const moedas = document.querySelector("#coin_mint_fill_max") ? document.querySelector("#coin_mint_fill_max") : null
    const segundos = storage.preferencias.tempo * 1000

    if (moedas) {
      moedas.click()
      botaoCunhagem.click()
    }

    setTimeout(() => location.reload(), numeroAleatorio(segundos, segundos + numeroAleatorio(100, 500)))
  }
}

$(document).ready(() => {
  criarUI()

  const botaoAlterar = document.querySelector("#alterar-script")
  const botaoIniciar = document.querySelector("#iniciar-script")
  botaoAlterar.addEventListener("click", salvarStorage)
  botaoIniciar.addEventListener("click", () => {
    storage.preferencias.status_cunhagem = !storage.preferencias.status_cunhagem
    salvarStorage()
    setTimeout(() => location.reload(), numeroAleatorio(500, 1000))
  })
  window.addEventListener("unload", salvarStorage)

  iniciarScript()
})
