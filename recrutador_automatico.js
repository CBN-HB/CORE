// ==UserScript==
// @name        Recrutamento Automático ~ CBN
// @version     1.1.0
// @description Recruta automaticamente a quantidade de tropas selecionadas
// @author      CBN
// @include     http*://*.*&screen=train*
// @include     http*://*.*&screen=barracks*
// @include     http*://*.*&screen=stable*
// @include     http*://*.*&screen=workshop*
// @require     https://code.jquery.com/jquery-3.7.0.min.js
// @grant       unsafeWindow
// ==/UserScript==
const objTropas = [
  {
    nome: "spear",
    quantidade: 0,
    recrutar: false,
  },
  {
    nome: "sword",
    quantidade: 0,
    recrutar: false,
  },
  {
    nome: "axe",
    quantidade: 0,
    recrutar: false,
  },
  {
    nome: "archer",
    quantidade: 0,
    recrutar: false,
  },
  {
    nome: "spy",
    quantidade: 0,
    recrutar: false,
  },
  {
    nome: "light",
    quantidade: 0,
    recrutar: false,
  },
  {
    nome: "marcher",
    quantidade: 0,
    recrutar: false,
  },
  {
    nome: "heavy",
    quantidade: 0,
    recrutar: false,
  },
  {
    nome: "ram",
    quantidade: 0,
    recrutar: false,
  },
  {
    nome: "catapult",
    quantidade: 0,
    recrutar: false,
  },
]
const mockStorage = {
  tropas: objTropas,
  preferencias: { status_recrutamento: false },
}
const storageRecrutamento = localStorage.getItem("recrutamento_automatico")
const storage = storageRecrutamento ? JSON.parse(storageRecrutamento) : mockStorage

function criarBotao(texto, id) {
  const botao = document.createElement("a")
  botao.classList = "btn"
  botao.id = id
  botao.style.margin = "3px 0"
  botao.textContent = texto

  return botao
}

function criarUI() {
  const tabela = document.createElement("table")
  tabela.classList = "vis"
  const headerLinha = document.createElement("tr")

  storage.tropas.forEach((tropa) => {
    const headerCelula = document.createElement("th")
    const imagemTropa = document.createElement("img")
    imagemTropa.src = `https://dsbr.innogamescdn.com/asset/8dd287c8/graphic/unit/unit_${tropa.nome}.png`

    headerCelula.appendChild(imagemTropa)
    headerLinha.appendChild(headerCelula)
  })

  tabela.appendChild(headerLinha)

  const checkboxLinha = document.createElement("tr")

  storage.tropas.forEach((tropa, index) => {
    const checkboxCelula = document.createElement("td")
    const checkbox = document.createElement("input")
    checkbox.id = `recrutar_${tropa.nome}`
    checkbox.type = "checkbox"
    checkbox.checked = tropa.recrutar

    checkbox.addEventListener("change", () => (storage.tropas[index].recrutar = checkbox.checked))

    checkboxCelula.appendChild(checkbox)
    checkboxLinha.appendChild(checkboxCelula)
  })

  tabela.appendChild(checkboxLinha)

  const numeroLinha = document.createElement("tr")

  storage.tropas.forEach((tropa, index) => {
    const numeroCelula = document.createElement("td")
    const numeroInput = document.createElement("input")
    numeroInput.id = `unidades_${tropa.nome}`
    numeroInput.type = "number"
    numeroInput.min = "0"
    numeroInput.value = tropa.quantidade

    numeroInput.addEventListener("change", () => (storage.tropas[index].quantidade = parseInt(numeroInput.value)))

    numeroCelula.appendChild(numeroInput)
    numeroLinha.appendChild(numeroCelula)
  })

  tabela.appendChild(numeroLinha)

  const divBotoes = document.createElement("div")
  const botaoAlterar = criarBotao("Alterar script", "alterar-script")
  const botaoIniciar = criarBotao(`${storage.preferencias.status_recrutamento ? "Desligar" : "Ligar"} script`, "iniciar-script")
  botaoIniciar.style.marginLeft = "5px"
  divBotoes.style.display = "flex"
  divBotoes.style.width = "100%"
  divBotoes.style.flexDirection = "row"
  divBotoes.style.justifyContent = "start"
  divBotoes.appendChild(botaoAlterar)
  divBotoes.appendChild(botaoIniciar)
  tabela.appendChild(divBotoes)

  const form = document.querySelector("#train_form")
  form.parentNode.insertBefore(tabela, form)
}

function criarToast(mensagem, status) {
  const toast = document.createElement("div")
  toast.classList = `autoHideBox ${status ? "success" : "error"}`
  toast.innerText = mensagem
  toast.style.padding = "5px"
  toast.style.transition = "opacity 0.5s ease-in-out"

  setTimeout(() => {
    toast.style.opacity = "0"
    setTimeout(() => {
      toast.remove()
    }, 500)
  }, 2500)

  document.body.appendChild(toast)
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
  console.log("[LOG]", "Salvando tropas:", formatarDataHora(Date.now()))
  localStorage.setItem("recrutamento_automatico", JSON.stringify(storage))
  criarToast("Alterações de tropas feitas com sucesso!", 1)
}

function confereRequisitos(tropaNome) {
  const recursos = {
    woodT: parseInt(document.querySelector(`#${tropaNome}_0_cost_wood`).textContent),
    stoneT: parseInt(document.querySelector(`#${tropaNome}_0_cost_stone`).textContent),
    ironT: parseInt(document.querySelector(`#${tropaNome}_0_cost_iron`).textContent),
    popT: parseInt(document.querySelector(`#${tropaNome}_0_cost_pop`).textContent),
    wood: parseInt(document.querySelector("#wood").textContent),
    stone: parseInt(document.querySelector("#stone").textContent),
    iron: parseInt(document.querySelector("#iron").textContent),
    pop: parseInt(document.querySelector("#pop_max_label").textContent) - parseInt(document.querySelector("#pop_current_label").textContent),
  }

  return (
    recursos.wood >= recursos.woodT &&
    recursos.stone >= recursos.stoneT &&
    recursos.iron >= recursos.ironT &&
    recursos.pop >= recursos.popT &&
    document.querySelectorAll(`.unit_sprite.unit_sprite_smaller.${tropaNome}`).length == 0
  )
}

function recrutarTropa(tropa) {
  const input = document.querySelector(`#${tropa.nome}_0`)
  const botaoRecrutar = document.querySelector(".btn.btn-recruit")

  setInterval(() => {
    console.log("[LOG]", "Fazendo conferência de requisitos:", formatarDataHora(Date.now()))

    if (confereRequisitos(tropa.nome)) {
      input.value = tropa.quantidade
      botaoRecrutar.click()
      setTimeout(() => location.reload(), 2000)
    }
  }, numeroAleatorio(10000, 20000))
}

function recrutarTropasSelecionadas() {
  console.log("[LOG]", "Script rodando!")
  criarToast("Script rodando, aguarde alguns segundos...", 1)

  storage.tropas.forEach((tropa) => {
    if (tropa.quantidade > 0 && tropa.recrutar) recrutarTropa(tropa)
  })
}

function iniciarScript() {
  if (storage.preferencias.status_recrutamento) {
    if (storage.tropas.find((tropa) => tropa.quantidade > 0 && tropa.recrutar)) recrutarTropasSelecionadas()
    else criarToast("Nenhuma tropa foi marcada ou quantidades menor que 1.", 0)
  }
}

$(document).ready(() => {
  criarUI()

  const botaoAlterar = document.querySelector("#alterar-script")
  const botaoIniciar = document.querySelector("#iniciar-script")
  botaoAlterar.addEventListener("click", salvarStorage)
  botaoIniciar.addEventListener("click", () => {
    storage.preferencias.status_recrutamento = !storage.preferencias.status_recrutamento
    salvarStorage()
    setTimeout(() => location.reload(), numeroAleatorio(500, 1000))
  })
  window.addEventListener("unload", salvarStorage)

  iniciarScript()
})
