//#region .......

// Mesma API que o portal React (src/api/config.js) — aluno e direção veem os mesmos dados.
const API_URL = "https://vendanza-api.onrender.com/api/utilizadores";
const API_INVENTARIO = "https://vendanza-api.onrender.com/api/inventario";
const API_HORARIO = "https://vendanza-api.onrender.com/api/horario";
const API_MODALIDADE = "https://vendanza-api.onrender.com/api/modalidade";
const API_AULAS = "https://vendanza-api.onrender.com/api/aulas";
const API_ESTUDIOS = "https://vendanza-api.onrender.com/api/estudios";
const API_TIPO_AULA = "https://vendanza-api.onrender.com/api/tipos-aula";
const API_PRESENCAS = "https://vendanza-api.onrender.com/api/presencas";
const API_INSCRICOES = "https://vendanza-api.onrender.com/api/inscricoes";
const API_AULAS_PRIVADAS = "https://vendanza-api.onrender.com/api/aulas-privadas";
const API_PAGAMENTOS = "https://vendanza-api.onrender.com/api/pagamentos";
const API_VERIFICAR = "https://vendanza-api.onrender.com/api/verificar";

// Desenvolvimento local (descomentar e comentar o bloco acima):
/* const API_URL = "http://localhost:8080/api/utilizadores";
const API_INVENTARIO = "http://localhost:8080/api/inventario";
const API_HORARIO = "http://localhost:8080/api/horario";
const API_MODALIDADE = "http://localhost:8080/api/modalidade";
const API_AULAS = "http://localhost:8080/api/aulas";
const API_ESTUDIOS = "http://localhost:8080/api/estudios";
const API_TIPO_AULA = "http://localhost:8080/api/tipos-aula";
const API_PRESENCAS = "http://localhost:8080/api/presencas";
const API_INSCRICOES = "http://localhost:8080/api/inscricoes";
const API_AULAS_PRIVADAS = "http://localhost:8080/api/aulas-privadas";
const API_PAGAMENTOS = "http://localhost:8080/api/pagamentos";
const API_VERIFICAR = "http://localhost:8080/api/verificar";
 */

//#region MODAIS ADMIN (substituem alert/confirm do browser)
let adminConfirmResolve = null;

function injetarModaisAdmin() {
    if (document.getElementById("admin-dialog-notify")) return;

    document.body.insertAdjacentHTML(
        "beforeend",
        `
        <div class="modal fade" id="admin-dialog-notify" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 20px 50px rgba(0,0,0,0.15);">
              <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold" id="admin-dialog-notify-title">Informação</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
              </div>
              <div class="modal-body pt-2">
                <p id="admin-dialog-notify-body" class="mb-0" style="color: #475569; line-height: 1.5;"></p>
              </div>
              <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">OK</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal fade" id="admin-dialog-confirm" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 20px 50px rgba(0,0,0,0.15);">
              <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold" id="admin-dialog-confirm-title">Confirmar</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
              </div>
              <div class="modal-body pt-2">
                <p id="admin-dialog-confirm-body" class="mb-0" style="color: #475569; line-height: 1.5;"></p>
              </div>
              <div class="modal-footer border-0 pt-0 gap-2">
                <button type="button" class="btn btn-light" id="admin-dialog-confirm-cancel" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary px-4" id="admin-dialog-confirm-ok">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
        `,
    );

    const confirmModal = document.getElementById("admin-dialog-confirm");
    confirmModal.addEventListener("hidden.bs.modal", () => {
        if (adminConfirmResolve) {
            adminConfirmResolve(false);
            adminConfirmResolve = null;
        }
    });
    document.getElementById("admin-dialog-confirm-cancel").addEventListener("click", () => {
        if (adminConfirmResolve) {
            adminConfirmResolve(false);
            adminConfirmResolve = null;
        }
    });
}

function adminNotificar(titulo, mensagem, tipo = "info") {
    injetarModaisAdmin();
    const titleEl = document.getElementById("admin-dialog-notify-title");
    const bodyEl = document.getElementById("admin-dialog-notify-body");
    if (titleEl) titleEl.textContent = titulo || "Informação";
    if (bodyEl) bodyEl.textContent = mensagem || "";
    if (tipo === "success" && titleEl) titleEl.style.color = "#059669";
    else if (tipo === "error" && titleEl) titleEl.style.color = "#dc2626";
    else if (titleEl) titleEl.style.color = "";

    const el = document.getElementById("admin-dialog-notify");
    if (typeof bootstrap !== "undefined" && el) {
        bootstrap.Modal.getOrCreateInstance(el).show();
    }
}

function adminConfirmar(titulo, mensagem) {
    injetarModaisAdmin();
    return new Promise((resolve) => {
        adminConfirmResolve = resolve;
        document.getElementById("admin-dialog-confirm-title").textContent = titulo || "Confirmar";
        document.getElementById("admin-dialog-confirm-body").textContent = mensagem || "";

        const el = document.getElementById("admin-dialog-confirm");
        const okBtn = document.getElementById("admin-dialog-confirm-ok");
        const modal =
            typeof bootstrap !== "undefined" ? bootstrap.Modal.getOrCreateInstance(el) : null;

        const onOk = () => {
            okBtn.removeEventListener("click", onOk);
            if (adminConfirmResolve) {
                adminConfirmResolve(true);
                adminConfirmResolve = null;
            }
            modal?.hide();
        };
        okBtn.addEventListener("click", onOk);
        modal?.show();
    });
}

window.adminNotificar = adminNotificar;
window.adminConfirmar = adminConfirmar;

/** Redireciona alert() do browser para modal Bootstrap em todas as páginas admin. */
function ativarSubstituicaoAlertasAdmin() {
    injetarModaisAdmin();
    if (window.__adminAlertsSubstituidos) return;
    window.__adminAlertsSubstituidos = true;
    window.alert = function (mensagem) {
        adminNotificar("Informação", String(mensagem ?? ""));
    };
}

window.ativarSubstituicaoAlertasAdmin = ativarSubstituicaoAlertasAdmin;
//#endregion

// FUNÇÃO AUXILIAR PARA ENVIAR TOKEN AUTOMATICAMENTE EM TODOS OS PEDIDOS
async function fetchComToken(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 403) {
        console.warn("Acesso Negado (403): Provável erro de Token ou falta de permissão.");
      }
      const errorText = await response.text();
      console.error(`Erro na API (${response.status}):`, errorText);
      
      // Retornar um objeto que imita a resposta mas evita erro no .json()
      return {
        ok: false,
        status: response.status,
        text: () => Promise.resolve(errorText),
        json: () => Promise.resolve([]) // Retorna array vazio para não quebrar os loops .forEach/.filter
      };
    }
    return response;
  } catch (error) {
    console.error("Erro de rede:", error);
    return {
      ok: false,
      status: 500,
      text: () => Promise.resolve(error.message),
      json: () => Promise.resolve([])
    };
  }
}

//#region MAIN PAGE
// ==========================================
//  CRUD DE PAGINA INICIAL
// ==========================================

function personalizarDashboard() {
  // 1. LER DA MEMÓRIA
  const dados = localStorage.getItem("usuarioLogado");
  const user = dados ? JSON.parse(dados) : null;

  // 2. VALIDAR ACESSO
  if (!user || user.tipo != 3) {
    alert("Acesso restrito à Direção!");
    window.location.replace(window.location.origin + "/index.html");
    return;
  }

  // 3. PERSONALIZAR A INTERFACE (Saudação)
  const elSaudacao = document.getElementById("nome-saudacao");
  if (elSaudacao && user.nome) {
    elSaudacao.innerText = user.nome.split(" ")[0];
  }

  // 4. PREENCHER O PERFIL NA NAVBAR (Nome e Email)
  const elPerfilNome = document.getElementById("perfil-nome-completo");
  const elPerfilEmail = document.getElementById("perfil-email");

  if (elPerfilNome) elPerfilNome.innerText = user.nome;
  if (elPerfilEmail) elPerfilEmail.innerText = user.email;

  // 5. LÓGICA DO AVATAR (Iniciais)
  const elAvatar = document.getElementById("user-initials-avatar");
  if (elAvatar && user.nome) {
    const partes = user.nome.trim().split(" ");
    let iniciais = "";

    if (partes.length >= 2) {
      // Primeira letra do primeiro e do último nome
      iniciais = partes[0][0] + partes[partes.length - 1][0];
    } else {
      // Se tiver apenas um nome, pega as duas primeiras letras
      iniciais = partes[0].substring(0, 2);
    }

    elAvatar.innerText = iniciais.toUpperCase();

    // Opcional: Atribuir uma cor baseada no nome para não ser sempre igual
    const cores = ['#4B49AC', '#FFC107', '#248AFD', '#FF4747', '#57B657'];
    const indiceCor = user.nome.length % cores.length;
    elAvatar.style.backgroundColor = cores[indiceCor];
  }
}
function executarLogout() {
  // 1. Limpa a memória (garante que usas a chave certa do login)
  localStorage.removeItem("usuarioLogado");

  // 2. Detetar onde estamos para saber quanto subir
  const path = window.location.pathname;

  if (path.includes("/admin/")) {
    // Se estiveres em /admin/admindashboard.html -> sobe 1 nível
    window.location.replace("../index.html");
  } else if (path.includes("/admin/pages/gestao/gestao_utilizadores.html")) {
    // Se estiveres em /pages/gestao/outra.html -> sobe 2 níveis
    window.location.replace("../../../index.html");
  } else if (path.includes("/admin/pages/forms/")) {
    // Se estiveres em /pages/gestao/outra.html -> sobe 2 níveis
    window.location.replace("../../../index.html");
  } else if (path.includes("/admin/pages/atribuicao/")) {
    // Se estiveres em /pages/gestao/outra.html -> sobe 2 níveis
    window.location.replace("../../../index.html");
  } else if (path.includes("/admin/pages/faturacao/")) {
    // Se estiveres em /pages/gestao/outra.html -> sobe 2 níveis
    window.location.replace("../../../index.html");
  } else {
    // Caso padrão (raiz)
    window.location.replace("index.html");
  }
}
function executarLogoutGestao() {
  // 1. Limpa a memória (garante que usas a chave certa do login)
  localStorage.removeItem("usuarioLogado");

  // 2. Detetar onde estamos para saber quanto subir
  const path = window.location.pathname;

  if (path.includes("/admin/pages/gestao/")) {
    // Se estiveres em /admin/admindashboard.html -> sobe 1 nível
    window.location.replace("../../../index.html");
  }
}
function executarLogoutAtribuicao() {
  // 1. Limpa a memória (garante que usas a chave certa do login)
  localStorage.removeItem("usuarioLogado");

  // 2. Detetar onde estamos para saber quanto subir
  const path = window.location.pathname;

  if (path.includes("/admin/pages/atribuicao/")) {
    // Se estiveres em /admin/admindashboard.html -> sobe 1 nível
    window.location.replace("../../../index.html");
  }
}
function executarLogoutFaturacao() {
  // 1. Limpa a memória (garante que usas a chave certa do login)
  localStorage.removeItem("usuarioLogado");

  // 2. Detetar onde estamos para saber quanto subir
  const path = window.location.pathname;

  if (path.includes("/admin/pages/faturacao/")) {
    // Se estiveres em /admin/admindashboard.html -> sobe 1 nível
    window.location.replace("../../../index.html");
  }
}
function executarLogoutInventario() {
  // 1. Limpa a memória (garante que usas a chave certa do login)
  localStorage.removeItem("usuarioLogado");

  // 2. Detetar onde estamos para saber quanto subir
  const path = window.location.pathname;

  if (path.includes("/admin/pages/inventario/")) {
    // Se estiveres em /admin/admindashboard.html -> sobe 1 nível
    window.location.replace("../../../index.html");
  }
}
function executarLogoutForms() {
  // 1. Limpa a memória (garante que usas a chave certa do login)
  localStorage.removeItem("usuarioLogado");

  // 2. Detetar onde estamos para saber quanto subir
  const path = window.location.pathname;

  if (path.includes("/admin/pages/forms/")) {
    // Se estiveres em /admin/admindashboard.html -> sobe 1 nível
    window.location.replace("../../../index.html");
  }
}

const START_HOUR = 9;
const END_HOUR = 22;
const ROW_HEIGHT = 56;

const DIAS_MAPA_ADMIN = {
    segunda: 1, terça: 2, terca: 2, quarta: 3, quinta: 4, sexta: 5, sábado: 6, sabado: 6,
    "segunda-feira": 1, "terça-feira": 2, "terca-feira": 2, "quarta-feira": 3,
    "quinta-feira": 4, "sexta-feira": 5,
};

const ESTADOS_COACHING_OCULTOS = new Set(["Cancelada", "Pedido", "A Aguardar", "Pendente"]);

let listaDocentesCache = [];
let listaHorariosCache = [];
let listaAulasPrivadasCache = [];
let weekOffset = 0;

function formatarDataISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function obterSegundaSemana(offset = 0) {
    const hoje = new Date();
    const dia = hoje.getDay();
    const diff = (dia === 0 ? -6 : 1) - dia;
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diff + offset * 7);
    segunda.setHours(12, 0, 0, 0);
    return segunda;
}

function obterDiasSemana(offset = 0) {
    const segunda = obterSegundaSemana(offset);
    const nomes = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const dias = [];
    for (let i = 0; i < 6; i++) {
        const d = new Date(segunda);
        d.setDate(segunda.getDate() + i);
        dias.push({
            dayNum: i + 1,
            date: d,
            dateStr: formatarDataISO(d),
            label: nomes[i],
            shortDate: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
        });
    }
    return dias;
}

function parseDataAula(dia) {
    if (!dia) return null;
    const s = String(dia).trim();
    if (s.includes("-")) {
        const d = new Date(`${s.substring(0, 10)}T12:00:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const parts = s.split("/");
    if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const d = new Date(`${yyyy}-${mm}-${dd}T12:00:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
}

function normalizarHora(hora) {
    if (!hora) return null;
    if (Array.isArray(hora)) {
        return `${String(hora[0]).padStart(2, "0")}:${String(hora[1] || 0).padStart(2, "0")}`;
    }
    return String(hora).substring(0, 5);
}

function calcularPosicaoBloco(hInicioStr, hFimStr) {
    const hi = normalizarHora(hInicioStr);
    const hf = normalizarHora(hFimStr);
    if (!hi) return null;

    const [hS, mS] = hi.split(":").map(Number);
    const [hE, mE] = (hf || hi).split(":").map(Number);

    const startMin = hS * 60 + mS;
    const endMin = hE * 60 + mE;
    const gridStart = START_HOUR * 60;
    const gridEnd = END_HOUR * 60;

    if (startMin >= gridEnd || endMin <= gridStart) return null;

    const visibleStart = Math.max(startMin, gridStart);
    const visibleEnd = Math.min(endMin > startMin ? endMin : startMin + 60, gridEnd);
    if (visibleEnd <= visibleStart) return null;

    const top = ((visibleStart - gridStart) / 60) * ROW_HEIGHT;
    const height = Math.max(((visibleEnd - visibleStart) / 60) * ROW_HEIGHT, 28);

    return { top, height, hi, hf: hf || hi };
}

function textoEstudio(idEstudio, estudioObj) {
    if (estudioObj?.idEstudio) return `Estúdio ${estudioObj.idEstudio}`;
    if (estudioObj?.nome) return estudioObj.nome;
    if (idEstudio) return `Estúdio ${idEstudio}`;
    return "Estúdio a definir";
}

function formatarDiaSemana(diaSemana) {
    if (!diaSemana) return "—";
    const s = String(diaSemana).trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatarDataPT(dia) {
    const d = parseDataAula(dia);
    if (!d) return dia || "—";
    return d.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function desenharGutter(gutterId) {
    const gutter = document.getElementById(gutterId);
    if (!gutter) return;
    gutter.innerHTML = "";
    for (let i = START_HOUR; i < END_HOUR; i++) {
        const hDiv = document.createElement("div");
        hDiv.className = "hour-mark";
        hDiv.innerText = `${String(i).padStart(2, "0")}:00`;
        gutter.appendChild(hDiv);
    }
}

function limparColunasGrelha(prefix) {
    for (let i = 1; i <= 6; i++) {
        const col = document.getElementById(`${prefix}-${i}`);
        if (col) col.innerHTML = "";
    }
}

function corPorModalidade(modDesc) {
    const desc = (modDesc || "").toLowerCase();
    if (desc.includes("yoga")) return "type-yoga";
    if (desc.includes("boxe")) return "type-boxe";
    if (desc.includes("dança") || desc.includes("danca") || desc.includes("ballet")) return "type-dança";
    return "type-default";
}

function criarCardHorario({ titulo, subtitulo, horario, cor, top, height, onClick }) {
    const card = document.createElement("div");
    card.className = `class-entry ${cor}`;
    card.style.top = `${top}px`;
    card.style.height = `${height}px`;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.innerHTML = `
        <span class="entry-title">${titulo}</span>
        <span class="entry-meta">${subtitulo}</span>
        <span class="entry-meta">${horario}</span>
    `;
    if (onClick) {
        card.addEventListener("click", onClick);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
            }
        });
    }
    return card;
}

let coachingModalAtual = null;

function abrirModalHorarioRegular(horario, pos, nomeDocente) {
    const el = document.getElementById("modal-horario-regular");
    if (!el || typeof bootstrap === "undefined") return;

    const modNome = horario.modalidade?.descricao || "Turma";
    document.getElementById("modal-reg-titulo").textContent = modNome;
    document.getElementById("modal-reg-dia").textContent = formatarDiaSemana(horario.diaSemana);
    document.getElementById("modal-reg-horario").textContent = `${pos.hi} – ${pos.hf}`;
    document.getElementById("modal-reg-professor").textContent = nomeDocente;
    document.getElementById("modal-reg-estudio").textContent = textoEstudio(horario.idEstudio, horario.estudio);
    document.getElementById("modal-reg-modalidade").textContent = modNome;

    const linkEditar = document.getElementById("modal-reg-btn-editar");
    if (linkEditar && horario.idHorario) {
        linkEditar.href = `pages/forms/form_horarios.html?id=${horario.idHorario}`;
    }

    bootstrap.Modal.getOrCreateInstance(el).show();
}

function abrirModalCoaching(aula, pos) {
    const el = document.getElementById("modal-coaching");
    if (!el || typeof bootstrap === "undefined") return;

    coachingModalAtual = aula;

    const modNome = aula.modalidade?.descricao || "Coaching";
    const formato = aula.tipoAula?.descricao || "Coaching";
    const docNome = aula.docente
        ? `${aula.docente.nome} ${aula.docente.apelido || ""}`.trim()
        : "Professor";
    const aluno = aula.encEducacao
        ? `${aula.encEducacao.nomeAluno || ""} ${aula.encEducacao.apelidoAluno || ""}`.trim()
        : "Aluno";

    document.getElementById("modal-coach-titulo").textContent = `${formato} · ${modNome}`;
    document.getElementById("modal-coach-data").textContent = formatarDataPT(aula.dia);
    document.getElementById("modal-coach-horario").textContent = `${pos.hi} – ${pos.hf}`;
    document.getElementById("modal-coach-professor").textContent = docNome;
    document.getElementById("modal-coach-aluno").textContent = aluno;
    document.getElementById("modal-coach-estudio").textContent = textoEstudio(null, aula.estudio);
    document.getElementById("modal-coach-estado").textContent = aula.estado || "—";
    document.getElementById("modal-coach-formato").textContent = formato;
    document.getElementById("modal-coach-preco").textContent = `${aula.duracao || "—"} min · ${aula.preco != null ? `${aula.preco}€` : "—"}`;

    const linkEditar = document.getElementById("modal-coach-btn-editar");
    if (linkEditar && aula.idAulaPrivada) {
        linkEditar.href = `pages/forms/form_aulas_particulares.html?id=${aula.idAulaPrivada}`;
    }

    bootstrap.Modal.getOrCreateInstance(el).show();
}

async function recarregarAulasPrivadasDashboard() {
    try {
        const resp = await fetchComToken(`${API_AULAS_PRIVADAS}`);
        if (resp.ok) {
            listaAulasPrivadasCache = await resp.json();
            renderizarGrelhaCoaching();
        }
    } catch (e) {
        console.error("Erro ao recarregar coachings:", e);
    }
}

async function eliminarCoachingDashboard() {
    if (!coachingModalAtual?.idAulaPrivada) return;
    if (!confirm("Tem a certeza que deseja eliminar este coaching?")) return;

    try {
        const response = await fetchComToken(
            `${API_AULAS_PRIVADAS}/eliminar/${coachingModalAtual.idAulaPrivada}`,
            { method: "DELETE" },
        );
        if (response.ok) {
            const modalEl = document.getElementById("modal-coaching");
            bootstrap.Modal.getInstance(modalEl)?.hide();
            coachingModalAtual = null;
            await recarregarAulasPrivadasDashboard();
        } else {
            alert("Erro ao eliminar: " + (await response.text()));
        }
    } catch (e) {
        console.error("Erro ao eliminar coaching:", e);
        alert("Erro ao eliminar o coaching.");
    }
}

function atualizarLabelSemana() {
    const el = document.getElementById("week-range-label");
    if (!el) return;
    const dias = obterDiasSemana(weekOffset);
    const inicio = dias[0];
    const fim = dias[5];
    const fmt = (d) => d.date.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
    el.textContent = `${fmt(inicio)} – ${fmt(fim)}`;
}

function atualizarCabecalhosCoaching() {
    const dias = obterDiasSemana(weekOffset);
    const hojeStr = formatarDataISO(new Date());
    const header = document.getElementById("header-coaching");
    if (!header) return;

    header.querySelectorAll(".day-label[data-day]").forEach((cell) => {
        const n = Number(cell.dataset.day);
        const info = dias[n - 1];
        if (!info) return;
        const isToday = info.dateStr === hojeStr;
        cell.classList.toggle("is-today", isToday);
        cell.innerHTML = `${info.label}<span class="day-date">${info.shortDate}</span>`;
    });
}

function mudarSemana(delta) {
    weekOffset += delta;
    atualizarLabelSemana();
    atualizarCabecalhosCoaching();
    renderizarGrelhaCoaching();
}

function irParaSemanaAtual() {
    weekOffset = 0;
    atualizarLabelSemana();
    atualizarCabecalhosCoaching();
    renderizarGrelhaCoaching();
}

async function carregarTudo() {
    try {
        const [respDoc, respMod, respHor, respPriv] = await Promise.all([
            fetchComToken(`${API_URL}/docentes`),
            fetchComToken(`${API_MODALIDADE}/modalidades`),
            fetchComToken(`${API_HORARIO}/horarios`),
            fetchComToken(`${API_AULAS_PRIVADAS}`),
        ]);

        listaDocentesCache = await respDoc.json();
        const modalidades = await respMod.json();
        listaHorariosCache = await respHor.json();
        listaAulasPrivadasCache = respPriv.ok ? await respPriv.json() : [];

        const selMod = document.getElementById("filter-modality");
        const selDoc = document.getElementById("filter-instructor");
        if (!selMod || !selDoc) return;

        selMod.innerHTML = '<option value="all">Todas as modalidades</option>';
        modalidades.forEach((m) => {
            selMod.add(new Option(m.descricao, m.idModalidade));
        });

        selDoc.innerHTML = '<option value="">Todos os professores</option>';
        selDoc.disabled = false;

        atualizarLabelSemana();
        atualizarCabecalhosCoaching();
        atualizarFiltroDocentes();
    } catch (e) {
        console.error("Erro ao inicializar:", e);
    }
}

function renderizarGrelhaRegular() {
    const modId = document.getElementById("filter-modality")?.value;
    const docId = document.getElementById("filter-instructor")?.value || "";

    limparColunasGrelha("day-reg");
    desenharGutter("time-gutter-regular");

    const horariosFiltrados = listaHorariosCache.filter((h) => {
        const matchMod =
            modId === "all" ||
            !modId ||
            (h.modalidade && String(h.modalidade.idModalidade) === String(modId));
        const matchDoc = docId === "" || String(h.idDocente) === String(docId);
        return matchMod && matchDoc;
    });

    horariosFiltrados.forEach((h) => {
        const diaSemanaNormal = h.diaSemana ? h.diaSemana.toLowerCase().trim() : "";
        const diaNum = DIAS_MAPA_ADMIN[diaSemanaNormal];
        if (!diaNum) return;

        const col = document.getElementById(`day-reg-${diaNum}`);
        if (!col) return;

        const pos = calcularPosicaoBloco(h.horaInicio, h.horaFim);
        if (!pos) return;

        const doc = listaDocentesCache.find((d) => d.idDocente === h.idDocente);
        const nomeDocente = doc ? `${doc.nome} ${doc.apelido || ""}`.trim() : "Prof. N/A";
        const modNome = h.modalidade?.descricao || "Turma";
        const estudioTxt = h.idEstudio || h.estudio ? ` · ${textoEstudio(h.idEstudio, h.estudio)}` : "";

        col.appendChild(
            criarCardHorario({
                titulo: modNome,
                subtitulo: nomeDocente + estudioTxt,
                horario: `${pos.hi} – ${pos.hf}`,
                cor: corPorModalidade(modNome),
                top: pos.top,
                height: pos.height,
                onClick: () => abrirModalHorarioRegular(h, pos, nomeDocente),
            }),
        );
    });
}

function renderizarGrelhaCoaching() {
    limparColunasGrelha("day-coach");
    desenharGutter("time-gutter-coaching");
    atualizarCabecalhosCoaching();

    const dias = obterDiasSemana(weekOffset);
    const datasSemana = new Set(dias.map((d) => d.dateStr));
    let count = 0;

    listaAulasPrivadasCache.forEach((aula) => {
        if (ESTADOS_COACHING_OCULTOS.has(aula.estado)) return;

        const dataAula = parseDataAula(aula.dia);
        if (!dataAula) return;

        const dataStr = formatarDataISO(dataAula);
        if (!datasSemana.has(dataStr)) return;

        const diaInfo = dias.find((d) => d.dateStr === dataStr);
        if (!diaInfo) return;

        const col = document.getElementById(`day-coach-${diaInfo.dayNum}`);
        if (!col) return;

        const pos = calcularPosicaoBloco(aula.horaInicio, aula.horaFim);
        if (!pos) return;

        count += 1;

        const modNome = aula.modalidade?.descricao || "Coaching";
        const docNome = aula.docente
            ? `${aula.docente.nome} ${aula.docente.apelido || ""}`.trim()
            : "Professor";
        const aluno = aula.encEducacao
            ? `${aula.encEducacao.nomeAluno || ""} ${aula.encEducacao.apelidoAluno || ""}`.trim()
            : "Aluno";
        const formato = aula.tipoAula?.descricao || "Coaching";
        const estudioLabel = textoEstudio(null, aula.estudio);

        col.appendChild(
            criarCardHorario({
                titulo: `${formato} · ${modNome}`,
                subtitulo: `${docNome} · ${aluno}`,
                horario: `${pos.hi} – ${pos.hf} · ${estudioLabel}`,
                cor: "type-coaching",
                top: pos.top,
                height: pos.height,
                onClick: () => abrirModalCoaching(aula, pos),
            }),
        );
    });

    const emptyMsg = document.getElementById("coaching-empty-msg");
    if (emptyMsg) {
        emptyMsg.classList.toggle("d-none", count > 0);
    }
}

function renderizarGrelha() {
    renderizarGrelhaRegular();
    renderizarGrelhaCoaching();
}

function atualizarFiltroDocentes() {
    const idModalidade = document.getElementById("filter-modality")?.value;
    const selDoc = document.getElementById("filter-instructor");
    if (!selDoc) return;

    selDoc.innerHTML = '<option value="">Todos os professores</option>';

    if (!idModalidade) {
        selDoc.disabled = true;
        renderizarGrelhaRegular();
        return;
    }

    selDoc.disabled = false;

    let docentesFiltrados = listaDocentesCache;
    if (idModalidade !== "all") {
        docentesFiltrados = listaDocentesCache.filter((doc) => {
            if (doc.modalidades && Array.isArray(doc.modalidades)) {
                return doc.modalidades.some((m) => String(m.idModalidade) === String(idModalidade));
            }
            return false;
        });
    }

    docentesFiltrados.forEach((d) => {
        selDoc.add(new Option(`${d.nome} ${d.apelido || ""}`.trim(), d.idDocente));
    });

    renderizarGrelhaRegular();
}

window.mudarSemana = mudarSemana;
window.irParaSemanaAtual = irParaSemanaAtual;
window.renderizarGrelha = renderizarGrelha;
window.renderizarGrelhaRegular = renderizarGrelhaRegular;
window.renderizarGrelhaCoaching = renderizarGrelhaCoaching;
window.eliminarCoachingDashboard = eliminarCoachingDashboard;

window.addEventListener("load", () => {
    if (window.location.pathname.includes("admindashboard.html")) {
        carregarTudo();
        const btnEliminar = document.getElementById("modal-coach-btn-eliminar");
        if (btnEliminar) {
            btnEliminar.addEventListener("click", eliminarCoachingDashboard);
        }
    }
});
//#endregion

//#region EVENTLISTENER
// ==========================================
//  EVENTOS DE CARREGAMENTO DE TABELAS
// ==========================================

// Listener centralizado para gerir o carregamento de todas as tabelas de gestão
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (document.body.classList.contains("with-welcome-text")) {
    ativarSubstituicaoAlertasAdmin();
  }

  // Gestão de Utilizadores (Geral)
  if (path.includes("admindashboard.html")) {
    personalizarDashboard();
  } else if (path.includes("gestao_utilizadores.html")) {
    personalizarDashboard();
    carregarUtilizadores();
  }else if (path.includes("gestao_professores.html")) {
    personalizarDashboard();
    carregarDocentes();
  }else if (path.includes("gestao_enceducacao.html")) {
    personalizarDashboard();
    carregarEncarregados();
  }else if (path.includes("gestao_direcao.html")) {
    personalizarDashboard();
    carregarDirecao();
  }else if (path.includes("gestao_horarios.html")) {
    personalizarDashboard();
    carregarHorarios();
    carregarAulasPrivadas();
  }else if (path.includes("gestao_aulas.html")) {
    personalizarDashboard();
    carregarAulasDadas();
  }else if (path.includes("gestao_estudios.html")) {
    personalizarDashboard();
    carregarEstudios();
    carregarTiposAula();
  }else if (path.includes("gestao_modalidades.html")) {
    personalizarDashboard();
    carregarModalidadesGeral();
    carregarModalidadesDocente();
  }else if (path.includes("gestao_presencas.html")) {
    personalizarDashboard();
    carregarPresencas();
  }else if (path.includes("gestao_inscricoes.html")) {
    personalizarDashboard();
    carregarInscricoes();
  }else if(path.includes("form_utilizadores.html")){
    personalizarDashboard();  
    
    // Verificar se a URL tem um ID (ex: form_utilizadores.html?id=5)
    const params = new URLSearchParams(window.location.search);
    const idParaEditar = params.get("id");

    if (idParaEditar) {
      // Se houver ID, estamos a editar: preenchemos o formulário
      editarUtilizadores(idParaEditar);
    }
  }else if (path.includes("form_enceducacao.html")) {
    personalizarDashboard();
    
    const params = new URLSearchParams(window.location.search);
    const idEnc = params.get("id");

    if (idEnc) {
        // Se houver ID na URL, carrega os dados para edição
        editarEncarregado(idEnc);
    }
  }else if (path.includes("form_professores.html")) { // Verifica o nome exato do teu ficheiro HTML
    personalizarDashboard();
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
        editarDocente(id);
    }
  }else if (path.includes("form_direcao.html")) {
    personalizarDashboard();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
        editarDirecao(id);
    }
  }else if (path.includes("form_horarios.html")) {
    personalizarDashboard();
    carregarOpcoesHorario();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
        editarHorarios(id);
    }
  }else if (path.includes("form_aulas_particulares.html")) {
    personalizarDashboard();

    // 1. Carrega as opções iniciais (Modalidades, Alunos, Estúdios, Tipos)
    // Usamos o .then() para garantir que os selects têm dados antes de tentar editar
    carregarOpcoesIniciaisAulasPrivadas().then(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        
        if (id) {
            // 2. Se houver ID, carregar os dados para edição
            editarAulaPrivada(id);
        }
    });
  }else if (path.includes("form_estudios.html")) {
    personalizarDashboard();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    if (id) {
        // Se houver ID na URL, carrega os dados para edição
        editarEstudio(id);
    }
  }else if (path.includes("form_tipoaula.html")) {
    personalizarDashboard();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    if (id) {
        // Dispara a função se estivermos a editar!
        editarTipoAula(id);
    }
  }else if (path.includes("form_modalidades.html")) {
    personalizarDashboard();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    if (id) {
        editarModalidade(id);
    }
  }else if (path.includes("form_modalidadedocente.html")) { // Muda o nome se o teu ficheiro HTML for diferente
    personalizarDashboard();

    // 1º Carrega as opções dos selects!
    carregarOpcoesModalidadeDocente().then(() => {
        
        // 2º Verifica se é edição
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        
        if (id) {
            editarModalidadeDocente(id);
        }
    });
  }else if (path.includes("form_inscricoes.html")) {
    personalizarDashboard();

    // 1º Carregar os Dropdowns com os Alunos e as Modalidades
    carregarOpcoesInscricao().then(() => {
        
        // 2º Se houver um ID no link, é para editar
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        
        if (id) {
            editarInscricao(id);
        }
    });
  }else if (path.includes("inventario_figurinos.html")){
    personalizarDashboard();
    carregarFigurinos();
  }else if (path.includes("form_inventario.html")) {
    personalizarDashboard();

    // 1º Carrega as listas de pessoas à socapa!
    carregarListasDonos().then(() => {
        // 2º Verifica se é para editar
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        
        if (id) {
            editarArtefacto(id);
        }
    });
  }else if (path.includes("inventario_acessorios.html")) {
    personalizarDashboard();
    carregarAcessorios();
  }else if (path.includes("inventario_cenarios.html")) {
    personalizarDashboard();
    carregarCenarios();
  }else if (path.includes("inventario_todos.html")) {
    personalizarDashboard();
    carregarTodos();
  }else if (path.includes("atribuicao_atrsalas.html")) {
    personalizarDashboard();
    carregarAtribuicoes();
    carregarFaturacaoCoaching()
  }else if (path.includes("atribuicao_aluguer.html")) {
    personalizarDashboard();
    carregarAtribuicoesAluguer();
  }else if (path.includes("faturacao_validacaofaturacao.html")) {
    personalizarDashboard();
    iniciarPagamentos();
  }else if (path.includes("form_pagamentos.html")) {
    personalizarDashboard();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
        editarPagamento(id);
    } else {
        carregarEncarregadosSelect();
        document.getElementById("data_pagamento").value = new Date().toISOString().split("T")[0];
    }
} 
});
  
  
//#endregion

//#region UTILIZADORES
// ==========================================
//  CRUD DE UTILIZADORES E FORMS
// ==========================================

async function carregarUtilizadores() {
  const tbody = document.querySelector("#tabela-utilizadores tbody");

  try {
    const response = await fetchComToken(API_URL); // API_URL já definida como http://localhost:8080/api/utilizadores
    const utilizadores = await response.json();

    // Limpa a tabela (remove as linhas de exemplo do HTML)
    tbody.innerHTML = "";

    utilizadores.forEach((user) => {
      // Formatar a data (dt) para algo legível
      const dataFormatada = new Date(user.dt).toLocaleDateString("pt-PT");

      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td>******</td>
                <td>
                    <label class="badge ${user.isactive === 1 ? "badge-success" : "badge-danger"}">
                        ${user.isactive === 1 ? "Ativo" : "Inativo"}
                    </label>
                </td>
                <td>${dataFormatada}</td>
                <td>${user.nome || "N/A"}</td>
                <td>${user.tipo}</td>
                <td>
                    <a href="../forms/form_utilizadores.html?id=${user.id}" class='btn btn-dark p-2'><i class='fa fa-pencil'></i></a>
                    <button onclick="eliminarUtilizador(${user.id})" class='btn btn-dark p-2'><i class='fa fa-trash'></i></button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar utilizadores:", error);
    tbody.innerHTML =
      "<tr><td colspan='8'>Erro ao carregar dados da base de dados.</td></tr>";
  }
}

//EDITAR UTILIZADOR / MOSTRAR NO FORMULÁRIO
async function editarUtilizadores(id) {
  try {
    const response = await fetchComToken(`${API_URL}/utilizador/${id}`);
    if (!response.ok) throw new Error("Utilizador não encontrado");
    
    const user = await response.json();
    console.log("Dados recebidos:", user); // Vê isto no F12 do browser

    // Preencher os campos com verificação de segurança (|| "" evita mostrar 'undefined')
    const campoId = document.getElementById("ID_Utilizador");
    if (campoId) campoId.value = user.id || user.idUtilizador || "";

    const campoEmail = document.getElementById("Email");
    if (campoEmail) campoEmail.value = user.email || "";

    const campoNome = document.getElementById("Nome");
    if (campoNome) campoNome.value = user.nome || "";

    const campoTipo = document.getElementById("Cod_Tipo");
    if (campoTipo) campoTipo.value = user.tipo || user.codTipo || "";

    const campoAtivo = document.getElementById("isactive");
    if (campoAtivo) {
        // Converte para string para o select reconhecer o value
        campoAtivo.value = user.isactive !== undefined ? user.isactive.toString() : "1";
    }

    const campoData = document.getElementById("dt");
    if (campoData) campoData.value = user.dt || user.dataNascimento || "";
    
  } catch (error) {
    console.error("Erro detalhado:", error);
    alert("Erro ao carregar dados do utilizador.");
  }
}

async function guardarUtilizadores(event) {
  event.preventDefault();

  const id = document.getElementById("ID_Utilizador").value;

  // Validação: Se não houver ID, não prosseguimos com a edição
  if (!id) {
    alert("Erro: ID do utilizador não encontrado. Não é possível editar.");
    return;
  }

  // Montagem do objeto com os dados do formulário
  const dados = {
    nome: document.getElementById("Nome").value,
    email: document.getElementById("Email").value,
    tipo: document.getElementById("Cod_Tipo").value,
    password: document.getElementById("Password").value,
    isactive: parseInt(document.getElementById("isactive").value) || 0,
    dt: document.getElementById("dt").value,

  };

  try {
    // Utilizando a tua tag conforme pedido
    const response = await fetchComToken(`${API_URL}/utilizador/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (response.ok) {
      alert("Utilizador atualizado com sucesso!");
      // Redireciona de volta para a lista de utilizadores
      window.location.href = "../gestao/gestao_utilizadores.html";
    } else {
      const erro = await response.text();
      alert("Erro ao atualizar utilizador: " + erro);
    }
  } catch (error) {
    console.error("Erro na submissão:", error);
    alert("Erro de comunicação com o servidor.");
  }
}

//ELIMINAR UTILIZADOR
async function eliminarUtilizador(id) {
  const confirmacao = confirm("Atenção: Ao eliminar este utilizador, todos os perfis associados (Docente/Aluno/Direção) serão removidos. Confirmar?");
  
  if (!confirmacao) return;

  try {
    const response = await fetchComToken(`${API_URL}/utilizador/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Utilizador removido com sucesso!");
      location.reload(); // Recarrega a tabela atual
    } else {
      alert("Erro ao eliminar utilizador da base de dados.");
    }
  } catch (error) {
    console.error("Erro ao eliminar:", error);
  }
}
//#endregion
//#region ENCARREGADOS
// ==========================================
//  CRUD DE ENCARREGADOS DE EDUCAÇÃO E FORMS
// ==========================================

// Função para carregar Encarregados de Educação

async function carregarEncarregados() {
  try {
    const response = await fetchComToken(`${API_URL}/alunos`); // Altera para o endpoint correto
    const lista = await response.json();

    const tabela = document.getElementById("tabela-enceducacao");
    if (!tabela) return;

    const tbody = tabela.querySelector("tbody");
    tbody.innerHTML = "";

    lista.forEach((enc) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${enc.idEncEducacao}</td>
                <td>${enc.nomeAluno}</td>
                <td>${enc.apelidoAluno}</td>
                <td>${enc.nomeEncEducacao}</td>
                <td>${enc.apelidoEncEducacao}</td>
                <td>${enc.telefone}</td>
                <td>${enc.dataNascimento}</td>
                <td>${enc.iban}</td>
                <td>${enc.nif}</td>
                <td>${enc.cp}</td>
                <td>
                    <a href="../forms/form_enceducacao.html?id=${enc.idEncEducacao}" class='btn btn-dark p-2'><i class='fa fa-pencil'></i></a>
                    <button onclick="eliminarUtilizador(${enc.idEncEducacao})" class='btn btn-dark p-2'><i class='fa fa-trash'></i></button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar encarregados:", error);
  }
}

async function editarEncarregado(id) {
    try {
        // 1. Procurar os dados do ALUNO
        const responseAluno = await fetchComToken(`${API_URL}/alunos/${id}`);
        if (!responseAluno.ok) throw new Error("Erro ao procurar dados do aluno");
        const dataAluno = await responseAluno.json();

        // 2. Procurar os dados do UTILIZADOR (Pai)
        // Usamos o endpoint que já criámos antes para utilizadores gerais
        const responseUser = await fetchComToken(`${API_URL}/utilizador/${id}`);
        let dataUser = {};
        if (responseUser.ok) {
            dataUser = await responseUser.json();
        }

        console.log("Dados do Aluno:", dataAluno);
        console.log("Dados do Utilizador:", dataUser);

        // --- PREENCHIMENTO DO FORMULÁRIO ---

        // 1. Campos do Utilizador (Pai)
        document.getElementById("ID_Utilizador").value = dataAluno.idEncEducacao;
        document.getElementById("Email").value = dataUser.email || "";
        document.getElementById("isactive").value = dataUser.isactive !== undefined ? dataUser.isactive.toString() : "1";
        
        // Se tiveres o campo 'dt' do utilizador
        if(document.getElementById("dt")) {
            document.getElementById("dt").value = dataUser.dt || "";
        }

        // 2. Campos do Aluno (Filho) - Usando os nomes exatos do teu log
        document.getElementById("nomealuno").value = dataAluno.nomeAluno || "";
        document.getElementById("apelidoaluno").value = dataAluno.apelidoAluno || "";
        document.getElementById("nomeenceducacao").value = dataAluno.nomeEncEducacao || "";
        document.getElementById("apelidoenceducacao").value = dataAluno.apelidoEncEducacao || "";
        document.getElementById("telefone").value = dataAluno.telefone || "";
        document.getElementById("datanascimento").value = dataAluno.dataNascimento || "";
        document.getElementById("nif").value = dataAluno.nif || "";
        document.getElementById("iban").value = dataAluno.iban || "";
        document.getElementById("cp").value = dataAluno.cp || "";

    } catch (error) {
        console.error("Erro completo ao carregar:", error);
        alert("Erro ao carregar dados do Encarregado e Utilizador.");
    }
}

async function guardarEncarregado(event) {
    event.preventDefault();

    const id = document.getElementById("ID_Utilizador").value;

    // Criar o payload exatamente como o Map do Java espera
    const payload = {
        id: id || null,
        email: document.getElementById("Email").value,
        password: document.getElementById("Password").value,
        isactive: document.getElementById("isactive").value,
        nomealuno: document.getElementById("nomealuno").value,
        apelidoaluno: document.getElementById("apelidoaluno").value,
        nomeenceducacao: document.getElementById("nomeenceducacao").value,
        apelidoenceducacao: document.getElementById("apelidoenceducacao").value,
        telefone: document.getElementById("telefone").value,
        datanascimento: document.getElementById("datanascimento").value, // Formato yyyy-mm-dd
        nif: document.getElementById("nif").value,
        iban: document.getElementById("iban").value,
        cp: document.getElementById("cp").value
    };

    try {
        const response = await fetchComToken(`${API_URL}/alunos/completo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Sucesso: Encarregado e Utilizador atualizados!");
            window.location.href = "../gestao/gestao_enceducacao.html";
        } else {
            const errorMsg = await response.text();
            alert("Erro ao guardar: " + errorMsg);
        }
    } catch (error) {
        console.error("Erro na submissão:", error);
        alert("Erro de comunicação com o servidor.");
    }
}

// Use a função que já temos para utilizadores gerais
async function eliminarEncarregado(id) {
    if (!confirm("Aviso: Eliminar o encarregado. Continuar?")) return;
    
    // Chamamos o endpoint de delete do utilizador (o CASCADE trata o resto)
    const response = await fetchComToken(`${API_URL}/utilizadores/utilizador/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        alert("Eliminado com sucesso!");
        location.reload();
    }
}

//#endregion 
//#region PROFESSORES
// ==========================================
//  CRUD DE PROFESSORES E FORMS
// ==========================================

// Exemplo para Professores
// Exemplo para a página gestao_professores.html
async function carregarDocentes() {
  try {
    // Altera para o endpoint que testaste no browser e funcionou
    const response = await fetchComToken(`${API_URL}/docentes`);
    const lista = await response.json();

    // Seleciona o corpo da tabela no teu HTML
    const tbody = document.querySelector("#tabela-professores tbody");
    if (!tbody) return;

    tbody.innerHTML = ""; // Limpa os dados de exemplo ("Jacob")

    lista.forEach((doc) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${doc.idDocente}</td>
                <td>${doc.tipoCoach || 'N/A'}</td>
                <td>${doc.nome}</td>
                <td>${doc.apelido}</td>
                <td>${doc.dataNascimento}</td>
                <td>${doc.morada}</td>
                <td>${doc.iban}</td>
                <td>${doc.nif}</td>
                <td>
                    <a href="../forms/form_professores.html?id=${doc.idDocente}" class="btn btn-dark p-2">
                        <i class="fa fa-pencil"></i>
                    </a>
                    <button onclick="eliminarUtilizador(${doc.idDocente})" class='btn btn-dark p-2'><i class='fa fa-trash'></i></button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao processar dados dos docentes:", error);
  }
}

async function editarDocente(id) {
    try {
        // Fetch dos dados específicos do Docente
        const respDocente = await fetchComToken(`${API_URL}/docentes/${id}`); // Ajusta a rota se necessário
        const dataDocente = await respDocente.json();

        // Fetch dos dados do Utilizador (Email/Ativo)
        const respUser = await fetchComToken(`${API_URL}/utilizador/${id}`);
        const dataUser = await respUser.json();

        // Preencher Utilizador
        document.getElementById("ID_Utilizador").value = id;
        document.getElementById("Email").value = dataUser.email || "";
        document.getElementById("isactive").value = dataUser.isactive !== undefined ? dataUser.isactive.toString() : "1";

        // Preencher Dados Docente
        document.getElementById("ID_Docente").value = dataDocente.idDocente || id;
        document.getElementById("tipocoach").value = dataDocente.tipoCoach || "";
        document.getElementById("nomedocente").value = dataDocente.nome || "";
        document.getElementById("apelidodocente").value = dataDocente.apelido || "";
        document.getElementById("datanascimento").value = dataDocente.dataNascimento || "";
        document.getElementById("morada").value = dataDocente.morada || "";
        document.getElementById("iban").value = dataDocente.iban || "";
        document.getElementById("nif").value = dataDocente.nif || "";

    } catch (error) {
        console.error("Erro ao carregar docente:", error);
    }
}

async function guardarDocente(event) {
    event.preventDefault();

    let idValue = document.getElementById("ID_Utilizador").value;
    // Se o ID for vazio, texto "null" ou undefined, enviamos null para o Java
    if (!idValue || idValue === "" || idValue === "null" || idValue === "undefined") {
        idValue = null;
    }

    const payload = {
        id: idValue,
        email: document.getElementById("Email").value,
        password: document.getElementById("Password").value,
        isactive: document.getElementById("isactive").value,
        tipocoach: document.getElementById("tipocoach").value,
        nome: document.getElementById("nomedocente").value, // O Java vai ler payload.get("nome")
        apelido: document.getElementById("apelidodocente").value,
        datanascimento: document.getElementById("datanascimento").value,
        morada: document.getElementById("morada").value,
        iban: document.getElementById("iban").value,
        nif: document.getElementById("nif").value,
        telefone: document.getElementById("telefone") ? document.getElementById("telefone").value : "912345678"
    };

    try {
        const response = await fetchComToken(`${API_URL}/docentes/completo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Docente guardado com sucesso!");
            window.location.href = "../gestao/gestao_professores.html";
        } else {
            alert("Erro ao guardar docente.");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

//#endregion
//#region DIRECAO

// ==========================================
//  CRUD DE DIRECAO E FORMS
// ==========================================

async function carregarDirecao() {
  try {
    const response = await fetchComToken(`${API_URL}/direcao`);
    const lista = await response.json();

    // Procura o corpo da tabela na página gestao_direcao.html
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    tbody.innerHTML = ""; // Limpa os dados estáticos ("Jacob")

    lista.forEach((membro) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${membro.idDirecao}</td>
                <td>${membro.nomeGestor}</td>
                <td>${membro.apelidoGestor}</td>
                <td>${membro.telefone}</td>
                <td>${membro.nif}</td>
                <td>
                    <a href="../forms/form_direcao.html?id=${membro.idDirecao}" class='btn btn-dark p-2'><i class='fa fa-pencil'></i></a>
                     <button onclick="eliminarUtilizador(${membro.idDirecao})" class='btn btn-dark p-2'><i class='fa fa-trash'>
                </td>
            `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar membros da direção:", error);
  }
}

// --- GESTÃO DE DIREÇÃO ---

async function editarDirecao(id) {
    try {
        const respDirecao = await fetchComToken(`${API_URL}/direcao2/${id}`);
        const dataDir = await respDirecao.json();

        const respUser = await fetchComToken(`${API_URL}/utilizador/${id}`);
        const dataUser = await respUser.json();

        // Preencher Pai
        document.getElementById("ID_Utilizador").value = id;
        document.getElementById("Email").value = dataUser.email || "";
        document.getElementById("isactive").value = dataUser.isactive !== undefined ? dataUser.isactive.toString() : "1";

        // Preencher Filho
        document.getElementById("nome_direcao").value = dataDir.nomeGestor || "";
        document.getElementById("apelido_direcao").value = dataDir.apelidoGestor || "";
        document.getElementById("telefone_direcao").value = dataDir.telefone || "";
        document.getElementById("nif_direcao").value = dataDir.nif || "";

    } catch (error) {
        console.error("Erro ao carregar direção:", error);
    }
}

async function guardarDirecao(event) {
    event.preventDefault();
    
    let idVal = document.getElementById("ID_Utilizador").value;
    const payload = {
        id: idVal || null,
        email: document.getElementById("Email").value,
        password: document.getElementById("Password").value,
        isactive: document.getElementById("isactive").value,
        nome: document.getElementById("nome_direcao").value,
        apelido: document.getElementById("apelido_direcao").value,
        telefone: document.getElementById("telefone_direcao").value,
        nif: document.getElementById("nif_direcao").value
    };

    const response = await fetchComToken(`${API_URL}/direcao2/completo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        alert("Membro da Direção guardado!");
        window.location.href = "../gestao/gestao_direcao.html";
    } else {
        alert("Erro ao guardar membro da direção.");
    }
}
//#endregion
//#region HORARIOS
// ==========================================
//  CRUD DE HORARIOS E FORMS
// ==========================================

//HORARIOS
// ==========================================
//  CRUD DE HORARIOS E LÓGICA DE DOCENTES
// ==========================================

let listaGlobalDocentesHorario = [];

// --- 1. CARREGAR A TABELA ---
async function carregarHorarios() {
    try {
        const response = await fetchComToken(`${API_HORARIO}/horarios`);
        const lista = await response.json();

        // Vamos buscar os docentes para cruzar o ID com o Nome na Tabela
        const respDocentes = await fetchComToken(`${API_URL}/docentes`);
        const docentes = respDocentes.ok ? await respDocentes.json() : [];

        const tabela = document.getElementById("tabela-horarios");
        if (!tabela) return;

        const tbody = tabela.querySelector("tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        lista.forEach((h) => {
            const modalidadeDesc = h.modalidade ? h.modalidade.descricao : "N/A";
            
            // Cruzar o ID do Docente com o Nome
            let nomeDocente = "Sem Docente";
            if (h.idDocente) {
                const doc = docentes.find(d => d.idDocente === h.idDocente);
                nomeDocente = doc ? `${doc.nome} ${doc.apelido || ''}` : `ID: ${h.idDocente}`;
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${h.idHorario}</td>
                <td><strong>${modalidadeDesc}</strong></td>
                <td>${h.diaSemana}</td>
                <td>${h.horaInicio}</td>
                <td>${h.horaFim}</td>
                <td>Estúdio ${h.idEstudio}</td>
                <td>${nomeDocente}</td>
                <td>
                    <a href="../forms/form_horarios.html?id=${h.idHorario}" class="btn btn-dark p-2">
                        <i class="fa fa-pencil"></i>
                    </a>
                    <button class="btn btn-dark p-2" onclick="eliminarHorario(${h.idHorario})">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar horários:", error);
    }
}

// --- 2. CARREGAR SELECTS NO FORMULÁRIO ---
async function carregarOpcoesHorario() {
    try {
        // Carregar Modalidades
        const respMod = await fetchComToken(`${API_MODALIDADE}/modalidades`);
        const modalidades = await respMod.json();
        const selectMod = document.getElementById("id_modalidade");
        
        if (selectMod) {
            selectMod.innerHTML = '<option value="">Selecione Modalidade...</option>';
            modalidades.forEach(m => {
                selectMod.innerHTML += `<option value="${m.idModalidade}">${m.descricao}</option>`;
            });
        }

        // Carregar Estúdios
        const respEst = await fetchComToken(`${API_ESTUDIOS}/estudios`);
        const estudios = await respEst.json();
        const selectEst = document.getElementById("id_estudio");
        
        if (selectEst) {
            selectEst.innerHTML = '<option value="">Selecione Estúdio...</option>';
            estudios.forEach(e => {
                selectEst.innerHTML += `<option value="${e.idEstudio}">Sala ${e.idEstudio} (Cap: ${e.alocacao})</option>`;
            });
        }

        // Carregar Docentes e guardar na variável global à socapa
        const respDoc = await fetchComToken(`${API_URL}/docentes`);
        if (respDoc.ok) {
            listaGlobalDocentesHorario = await respDoc.json();
        }

    } catch (error) {
        console.error("Erro ao carregar selects do horário:", error);
    }
}

// --- 3. O FILTRO MÁGICO DE DOCENTES ---
function atualizarDocentesDaModalidade() {
    const idModalidade = document.getElementById("id_modalidade").value;
    const selectDocente = document.getElementById("id_docente");

    selectDocente.innerHTML = '<option value="">Selecione o Docente...</option>';

    if (!idModalidade) {
        selectDocente.disabled = true;
        selectDocente.innerHTML = '<option value="">1º Selecione a Modalidade...</option>';
        return;
    }

    selectDocente.disabled = false;

    let docentesFiltrados = [];

    // Tenta filtrar: Só professores que tenham a modalidade selecionada na sua lista
    // (Isto depende de o teu Java enviar o array 'modalidades' no JSON dos docentes)
    docentesFiltrados = listaGlobalDocentesHorario.filter(doc => {
        if (doc.modalidades && Array.isArray(doc.modalidades)) {
            return doc.modalidades.some(m => m.idModalidade == idModalidade);
        }
        return false;
    });

    // SISTEMA DE SEGURANÇA: Se o filtro der 0 resultados (ou o Java não enviar a lista de modalidades), mostra TODOS os professores para não encravar o sistema.
    if (docentesFiltrados.length === 0) {
        console.warn("Filtro falhou ou não há docentes associados a esta modalidade. A mostrar todos os docentes.");
        docentesFiltrados = listaGlobalDocentesHorario;
    }

    docentesFiltrados.forEach(doc => {
        selectDocente.innerHTML += `<option value="${doc.idDocente}">${doc.nome} ${doc.apelido || ''}</option>`;
    });
}

// --- 4. GUARDAR HORÁRIO ---
async function guardarHorario(event) {
    event.preventDefault();

    const idVal = document.getElementById("idHorario").value;
    
    const payload = {
        idHorario: idVal && idVal !== "" ? parseInt(idVal) : null,
        modalidade: {
            idModalidade: parseInt(document.getElementById("id_modalidade").value)
        },
        idDocente: parseInt(document.getElementById("id_docente").value), // NOVO CAMPO
        diaSemana: document.getElementById("dia_semana").value,
        horaInicio: document.getElementById("hora_inicio").value, 
        horaFim: document.getElementById("hora_fim").value,       
        idEstudio: parseInt(document.getElementById("id_estudio").value)
    };

    try {
        const response = await fetchComToken(`${API_HORARIO}/horarios/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Horário guardado com sucesso!");
            window.location.href = "../gestao/gestao_horarios.html"; 
        } else {
            alert("Erro ao guardar: " + await response.text());
        }
    } catch (error) {
        console.error("Erro no fetch:", error);
    }
}

// --- 5. EDITAR HORÁRIO ---
async function editarHorarios(id) {
    try {
        await carregarOpcoesHorario();

        const response = await fetchComToken(`${API_HORARIO}/horarios/${id}`);
        if (!response.ok) throw new Error("Horário não encontrado");
        
        const h = await response.json();

        document.getElementById("idHorario").value = h.idHorario;
        document.getElementById("id_modalidade").value = h.modalidade.idModalidade;
        
        // Ativa e filtra os professores com base na modalidade recém-carregada!
        atualizarDocentesDaModalidade();
        
        // Seleciona o professor correto
        if (h.idDocente) {
            document.getElementById("id_docente").value = h.idDocente;
        }

        document.getElementById("dia_semana").value = h.diaSemana;
        document.getElementById("hora_inicio").value = h.horaInicio.substring(0, 5);
        document.getElementById("hora_fim").value = h.horaFim.substring(0, 5);
        document.getElementById("id_estudio").value = h.idEstudio;

    } catch (error) {
        console.error("Erro ao carregar para edição:", error);
    }
}

// --- 6. ELIMINAR (Igual) ---
async function eliminarHorario(id) {
    if (!confirm("Tem a certeza que deseja eliminar esta Aula do Horário?")) return;

    try {
        const response = await fetchComToken(`${API_HORARIO}/eliminar/${id}`, { method: 'DELETE' });

        if (response.ok) {
            alert("Horário eliminado com sucesso!");
            carregarHorarios(); 
        } else {
            alert("Não foi possível eliminar: " + await response.text());
        }
    } catch (error) {
        console.error("Erro ao eliminar horário:", error);
    }
}

//AULA PARTICULARES

async function carregarAulasPrivadas() {
  try {
    const response = await fetchComToken(`${API_AULAS_PRIVADAS}`);
    if (!response.ok) throw new Error("Falha na resposta do servidor");

    const aulas = await response.json();
    const tbody = document.querySelector("#tabela-aulas-privadas tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (aulas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="14" class="text-center">N/A - Sem aulas agendadas</td></tr>';
      return;
    }

    aulas.forEach((aula) => {
      const modNome = aula.modalidade ? aula.modalidade.descricao : "N/A";
      const estNome = aula.estudio ? `Sala ${aula.estudio.idEstudio}` : "N/A";

      // Graças ao duplo-mapeamento do Java, agora tens objetos reais para ler os nomes!
      const docRef = aula.docente ? aula.docente.nome : "N/A";
      const encRef = aula.encEducacao ? aula.encEducacao.nomeAluno : "N/A";
      const codAulaRef = aula.tipoAula ? aula.tipoAula.descricao : "N/A";

      tbody.innerHTML += `
        <tr>
            <td>${aula.idAulaPrivada}</td>
            <td>${modNome}</td>
            <td>${docRef}</td>
            <td>${encRef}</td>
            <td>${estNome}</td>
            <td>${codAulaRef}</td>
            <td>${aula.dia}</td>
            <td>${aula.horaInicio}</td>
            <td>${aula.horaFim}</td>
            <td>${aula.duracao} min</td>
            <td>${aula.preco}€</td>
            <td><span class="badge ${aula.estado === "Cancelada" ? "bg-danger" : "bg-success"}">${aula.estado}</span></td>
            <td>
                <a href="../forms/form_aulas_particulares.html?id=${aula.idAulaPrivada}" class="btn btn-dark p-2">
                    <i class="fa fa-pencil"></i>
                </a>
                <button class="btn btn-dark p-2" onclick="eliminarAulaPrivada(${aula.idAulaPrivada})">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Erro ao carregar aulas privadas:", error);
  }
}

//  ELIMINAR
async function eliminarAulaPrivada(id) {
    if (!confirm("Tem a certeza que deseja eliminar esta aula privada?")) return;

    try {
        const response = await fetchComToken(`${API_AULAS_PRIVADAS}/eliminar/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Aula eliminada com sucesso!");
            carregarAulasPrivadas(); // Recarrega a tabela
        } else {
            const erroMsg = await response.text();
            alert("Erro ao eliminar: " + erroMsg);
        }
    } catch (error) {
        console.error("Erro no fetch eliminar:", error);
        alert("Erro de ligação ao servidor.");
    }
}

async function carregarOpcoesIniciaisAulasPrivadas() {
    try {
        // 1. Carregar Modalidades
        const respMod = await fetchComToken(`${API_MODALIDADE}/modalidades`);
        const modalidades = await respMod.json();
        preencherSelect("id_modalidade", modalidades, "idModalidade", "descricao");

        // 2. Carregar Encarregados (Alunos)
        const respAlu = await fetchComToken(`${API_URL}/alunos`);
        const alunos = await respAlu.json();
        // Usamos nomeenceducacao para o admin saber quem é o responsável
       console.log("Dados recebidos dos Alunos:", alunos[0]); // Verifica isto na consola (F12)

      const selectEnc = document.getElementById("id_enceducacao");
      if (selectEnc) {
          selectEnc.innerHTML = '<option value="">Selecione o Encarregado</option>';
          alunos.forEach(aluno => {
              // Usamos as variáveis exatas do teu Model Java: nomeAluno e apelidoAluno
              // Se no F12 aparecer 'nomealuno' tudo minúsculo, muda aqui também
              const nomeCompleto = `${aluno.nomeAluno} ${aluno.apelidoAluno}`;
              selectEnc.innerHTML += `<option value="${aluno.idEncEducacao}">${nomeCompleto}</option>`;
          });
      }

        // 3. Carregar Estúdios
        const respEst = await fetchComToken(`${API_ESTUDIOS}/estudios`);
        const estudios = await respEst.json();
        preencherSelect("id_estudio", estudios, "idEstudio", "idEstudio", "Sala ");

        // 4. Carregar Tipos de Aula
        const respTipo = await fetchComToken(`${API_TIPO_AULA}/tipos-aula`);
        const tipos = await respTipo.json();
        preencherSelect("cod_tipoaula", tipos, "codTipoAula", "descricao");

    } catch (error) {
        console.error("Erro ao carregar opções iniciais:", error);
    }
}

// Função auxiliar para não repetir código de preencher selects
function preencherSelect(idElemento, dados, valorCampo, textoCampo, prefixo = "") {
    const select = document.getElementById(idElemento);
    if (!select) return;
    select.innerHTML = `<option value="">Selecione...</option>`;
    dados.forEach(item => {
        select.innerHTML += `<option value="${item[valorCampo]}">${prefixo}${item[textoCampo]}</option>`;
    });
}

async function carregarDocentesPorModalidade(idModalidade) {
    const selectDocente = document.getElementById("id_docente");
    
    if (!idModalidade) {
        selectDocente.innerHTML = '<option value="">Selecione a Modalidade primeiro</option>';
        selectDocente.disabled = true;
        return;
    }

    try {
        const resp = await fetchComToken(`${API_MODALIDADE}/docentes-por-modalidade/${idModalidade}`);
        if (resp.status === 204) {
            selectDocente.innerHTML = '<option value="">Sem docentes para esta modalidade</option>';
            selectDocente.disabled = true;
            return;
        }
        
        const atribuicoes = await resp.json();
        selectDocente.innerHTML = '<option value="">Selecione o Professor</option>';
        
        atribuicoes.forEach(a => {
            // Acedemos ao objeto docente dentro da atribuição
            selectDocente.innerHTML += `<option value="${a.docente.idDocente}">${a.docente.nome} ${a.docente.apelido}</option>`;
        });

        selectDocente.disabled = false;
    } catch (error) {
        console.error("Erro ao filtrar docentes:", error);
    }
}

// --- CARREGAR DADOS PARA EDIÇÃO ---
async function editarAulaPrivada() {
    // 1. Vai ver se existe um "?id=X" no link da página
    const urlParams = new URLSearchParams(window.location.search);
    const idEdicao = urlParams.get('id');

    // Se não houver ID, é porque o utilizador quer criar uma aula nova. Sair da função!
    if (!idEdicao) return;

    try {
        // 2. Vai buscar os dados daquela aula específica ao Java
        const response = await fetchComToken(`${API_AULAS_PRIVADAS}/${idEdicao}`);
        if (!response.ok) throw new Error("Erro ao carregar os dados da aula.");
        
        const aula = await response.json();

        // 3. Preencher o ID oculto no formulário (Isto é o que diz ao Java para fazer UPDATE)
        document.getElementById("id_aulaprivada").value = aula.idAulaPrivada;

        // 4. Preencher os Selects (Objetos e Variáveis Simples)
        if (aula.modalidade) document.getElementById("id_modalidade").value = aula.modalidade.idModalidade;
        if (aula.estudio) document.getElementById("id_estudio").value = aula.estudio.idEstudio;
        
        // Os nossos 3 "blindados"
        if (aula.idDocente) document.getElementById("id_docente").value = aula.idDocente;
        if (aula.idEncEducacao) document.getElementById("id_enceducacao").value = aula.idEncEducacao;
        if (aula.cod_tipoaula) document.getElementById("cod_tipoaula").value = aula.cod_tipoaula;

        // 5. Preencher os campos de Texto e Data
        document.getElementById("dia").value = aula.dia;
        document.getElementById("preco").value = aula.preco;
        document.getElementById("estado").value = aula.estado;

        // As horas às vezes vêm do Java como "14:00:00", o HTML prefere "14:00"
        if (aula.horaInicio) document.getElementById("hora_inicio").value = aula.horaInicio.substring(0, 5);
        if (aula.horaFim) document.getElementById("hora_fim").value = aula.horaFim.substring(0, 5);

    } catch (error) {
        console.error("Erro a carregar aula para edição:", error);
    }
}

async function guardarAulaPrivada(event) {
    event.preventDefault();

    let idVal = document.getElementById("id_aulaprivada").value;
    let codTipo = parseInt(document.getElementById("cod_tipoaula").value);

    if (isNaN(codTipo) || !codTipo) {
        codTipo = 1;
    }

    const payload = {
        idAulaPrivada: idVal ? parseInt(idVal) : null,
        modalidade: { idModalidade: parseInt(document.getElementById("id_modalidade").value) || 1 },
        estudio: { idEstudio: parseInt(document.getElementById("id_estudio").value) || 1 },
        
        // Enviamos apenas o ID em número, o Java trata do resto!
        idDocente: parseInt(document.getElementById("id_docente").value) || 1,
        idEncEducacao: parseInt(document.getElementById("id_enceducacao").value) || 1,

        cod_tipoaula: codTipo,

        dia: document.getElementById("dia").value,
        horaInicio: document.getElementById("hora_inicio").value,
        horaFim: document.getElementById("hora_fim").value,
        preco: parseFloat(document.getElementById("preco").value) || 0,
        estado: document.getElementById("estado").value || "Pendente",
        duracao: 60
    };

    try {
        const response = await fetchComToken(`${API_AULAS_PRIVADAS}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Aula Privada guardada e mapeada com sucesso!");
            window.location.href = "../gestao/gestao_horarios.html";
        } else {
            const erroTexto = await response.text();
            alert("Erro do Servidor: " + erroTexto);
        }
    } catch (error) {
        console.error("Erro no fetch:", error);
    }
}
//#endregion
//#region AULAS DADAS
// ==========================================
//  CRUD DE AULAS E FORMS
// ==========================================

async function carregarAulasDadas() {
 try {
        // 1. Carregar o histórico todo
        const respAulas = await fetchComToken(API_AULAS); // Ajusta para a tua constante API_AULAS se tiveres
        let aulas = await respAulas.json();

        // 2. Carregar as Modalidades para cruzar o ID com o Nome
        const respModalidades = await fetchComToken(`${API_MODALIDADE}/modalidades`);
        const modalidades = respModalidades.ok ? await respModalidades.json() : [];

        const tbody = document.querySelector("#tabela-aulas tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (aulas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Nenhum histórico de aulas encontrado.</td></tr>`;
            return;
        }

        // BÓNUS: Ordenar da aula mais recente (maior ID) para a mais antiga
        aulas.sort((a, b) => b.idAula - a.idAula);

        aulas.forEach(aula => {
            // --- TRADUÇÃO DE DADOS ---
            
            // 1. Nome da Modalidade
            let nomeModalidade = "Desconhecida";
            if (aula.idModalidade) {
                const modEncontrada = modalidades.find(m => m.idModalidade === aula.idModalidade);
                nomeModalidade = modEncontrada ? modEncontrada.descricao : `ID: ${aula.idModalidade}`;
            }

            // 2. Tipo de Aula (Como tem a relação no Java, já vem no JSON se não for null)
            const nomeTipoAula = aula.tipoAula ? aula.tipoAula.descricao : `Cód: ${aula.cod_tipoaula || '-'}`;

            // 3. Formatação do Estúdio
            const nomeEstudio = aula.idEstudio ? `Sala ${aula.idEstudio}` : "-";

            // 4. Formatação das Horas (Cortar os segundos: "18:00:00" -> "18:00")
            const horaIn = aula.horaInicio ? aula.horaInicio.substring(0, 5) : "-";
            const horaOut = aula.horaFim ? aula.horaFim.substring(0, 5) : "-";

            // 5. Formatação da Data (YYYY-MM-DD para DD/MM/YYYY)
            let dataFormatada = "-";
            if (aula.dataAula) {
                const partes = aula.dataAula.split('-');
                dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
            }

            // 6. Lógica da Origem (Regular vs Privada)
            let badgeOrigem = "";
            if (aula.idHorario) {
                // Se tiver ID de horário, é uma aula da grelha normal (Azul)
                badgeOrigem = `<span class="badge badge-outline-primary" style="font-size: 0.85rem;">Regular (ID: ${aula.idHorario})</span>`;
            } else if (aula.idAulaPrivada) {
                // Se tiver ID de privada, é uma aula pedida à parte (Laranja/Amarelo)
                badgeOrigem = `<span class="badge badge-outline-warning" style="font-size: 0.85rem;">Privada (ID: ${aula.idAulaPrivada})</span>`;
            } else {
                badgeOrigem = `<span class="badge badge-outline-secondary">Não Definida</span>`;
            }

            // --- DESENHAR A LINHA ---
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${aula.idAula}</td>
                <td><strong>${nomeModalidade}</strong></td>
                <td>${nomeTipoAula}</td>
                <td>${nomeEstudio}</td>
                <td>${dataFormatada}</td>
                <td><i class="fa fa-clock-o text-muted"></i> ${horaIn}</td>
                <td><i class="fa fa-clock-o text-muted"></i> ${horaOut}</td>
                <td>${badgeOrigem}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar histórico de aulas:", error);
    }
}

function filtrarAulas() {
    const filtro = document.getElementById("filtro-origem").value.toLowerCase();
    
    // Vai buscar todas as linhas (tr) que estão dentro do corpo (tbody) da tabela
    const linhas = document.querySelectorAll("#tabela-aulas tbody tr");

    linhas.forEach(tr => {
        // Se a linha for a mensagem de "Nenhum histórico encontrado", ignoramos
        if (tr.cells.length === 1) return;

        // Vai buscar o texto da última coluna (onde diz "Regular" ou "Privada")
        const colunaOrigem = tr.querySelector("td:last-child").textContent.toLowerCase();

        // Lógica de esconder/mostrar a linha conforme a escolha
        if (filtro === "todas") {
            tr.style.display = ""; // Mostra a linha
        } else if (filtro === "regular" && colunaOrigem.includes("regular")) {
            tr.style.display = ""; // Mostra a linha
        } else if (filtro === "privada" && colunaOrigem.includes("privada")) {
            tr.style.display = ""; // Mostra a linha
        } else {
            tr.style.display = "none"; // Esconde a linha
        }
    });
}

//#endregion
//#region ESTUDIOS
// ==========================================
//  CRUD DE ESTUDIOS E TIPOS DE AULA E FORMS
// ==========================================

async function carregarEstudios() {
  const response = await fetchComToken(`${API_ESTUDIOS}/estudios`);
  const dados = await response.json();

  // 2. A MAGIA AQUI: Ordena a lista pelo ID do Estúdio (do menor para o maior)
  dados.sort((a, b) => a.idEstudio - b.idEstudio);

  const tbody = document.querySelector("#tabela-estudios tbody");
  if (tbody) {
    tbody.innerHTML = dados
      .map(
        (e) => `
            <tr>
                <td>${e.idEstudio}</td>
                <td>${e.tamanho}</td>
                <td>${e.alocacao}</td>
                <td>
                    <a href="../forms/form_estudios.html?id=${e.idEstudio}" class="btn btn-dark p-2">
                            <i class="fa fa-pencil"></i>
                    </a>
                    <button class="btn btn-dark p-2" onclick="eliminarEstudio(${e.idEstudio})">
                            <i class="fa fa-trash"></i>
                    </button>
                </td>
            </tr>
        `,
      )
      .join("");
  }
}

// Função para Guardar (Criar Novo ou Atualizar)
async function guardarEstudio(event) {
    event.preventDefault();

    const idVal = document.getElementById("id_estudio").value;
    
    const payload = {
        idEstudio: idVal ? parseInt(idVal) : null,
        tamanho: parseFloat(document.getElementById("tamanho").value),
        alocacao: parseInt(document.getElementById("alocacao").value) // Confirma se no Java a variável está 'alocacao'
    };

    try {
        // AQUI: Atualizado para o teu endpoint /guardar
        const response = await fetchComToken(`${API_ESTUDIOS}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Estúdio guardado com sucesso!");
            window.location.href = "../gestao/gestao_estudios.html"; 
        } else {
            const erroTexto = await response.text();
            alert("Erro ao guardar: " + erroTexto);
        }
    } catch (error) {
        console.error("Erro no fetch guardar Estudio:", error);
    }
}

// Função para preencher o formulário na Edição
async function editarEstudio(id) {
    try {
        // AQUI: Atualizado para bater certo com o teu @GetMapping("/estudios/{id}")
        const response = await fetchComToken(`${API_ESTUDIOS}/estudios/${id}`);
        
        if (!response.ok) throw new Error("Erro ao carregar o estúdio.");
        
        const estudio = await response.json();

        // Preenche os campos do formulário
        document.getElementById("id_estudio").value = estudio.idEstudio;
        document.getElementById("tamanho").value = estudio.tamanho;
        document.getElementById("alocacao").value = estudio.alocacao;


    } catch (error) {
        console.error("Erro a carregar estúdio para edição:", error);
    }
}

// Função para Eliminar
async function eliminarEstudio(id) {
    if (!confirm("Tem a certeza que deseja eliminar este estúdio?")) return;
    
    try {
        // AQUI: Este já estava certo com o teu @DeleteMapping("/eliminar/{id}")
        const response = await fetchComToken(`${API_ESTUDIOS}/eliminar/${id}`, { 
            method: 'DELETE' 
        });
        
        if (response.ok) {
            alert("Estúdio eliminado com sucesso!");
            carregarEstudios(); // Recarrega a tabela automaticamente
        } else {
            const erroMsg = await response.text();
            alert("Erro ao eliminar: " + erroMsg);
        }
    } catch (error) {
        console.error("Erro no fetch eliminar estúdio:", error);
    }
}


//CRUD TIPO AULA

async function carregarTiposAula() {
  const response = await fetchComToken(`${API_TIPO_AULA}/tipos-aula`);
  const dados = await response.json();

  // 2. A MAGIA AQUI: Ordena a lista pelo ID do Tipo de Aula (do menor para o maior)
  dados.sort((a, b) => a.codTipoAula - b.codTipoAula);

  const tbody = document.querySelector("#tabela-tipoaula tbody");
  if (tbody) {
    tbody.innerHTML = dados
      .map(
        (t) => `
            <tr>
                <td>${t.codTipoAula}</td>
                <td>${t.descricao}</td>
                <td>
                    <a href="../forms/form_tipoaula.html?id=${t.codTipoAula}" class="btn btn-dark p-2">
                            <i class="fa fa-pencil"></i>
                    </a>
                    <button class="btn btn-dark p-2" onclick="eliminarTipoAula(${t.codTipoAula})">
                            <i class="fa fa-trash"></i>
                    </button>
                </td>
            </tr>
        `,
      )
      .join("");
  }
}

// --- GUARDAR TIPO DE AULA ---
async function guardarTipoAula(event) {
    event.preventDefault();

    const idVal = document.getElementById("codTipoAula").value;
    
    const payload = {
        codTipoAula: idVal ? parseInt(idVal) : null,
        // Vai ler perfeitamente a opção que escolheste no Select!
        descricao: document.getElementById("descricao").value 
    };

    try {
        const response = await fetchComToken(`${API_TIPO_AULA}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Tipo de Aula guardado com sucesso!");
            window.location.href = "../gestao/gestao_estudios.html"; 
        } else {
            const erroTexto = await response.text();
            alert("Erro ao guardar: " + erroTexto);
        }
    } catch (error) {
        console.error("Erro no fetch guardar Tipo Aula:", error);
    }
}

// --- EDITAR TIPO DE AULA ---
async function editarTipoAula(id) {
    try {
        const response = await fetchComToken(`${API_TIPO_AULA}/tipos-aula/${id}`);
        if (!response.ok) throw new Error("Erro ao carregar o Tipo de Aula.");
        
        const dados = await response.json();

        // Preenche o ID e faz a magia de selecionar a opção certa no Select automaticamente!
        document.getElementById("codTipoAula").value = dados.codTipoAula;
        document.getElementById("descricao").value = dados.descricao;

    } catch (error) {
        console.error("Erro a carregar para edição:", error);
    }
}

// --- ELIMINAR TIPO DE AULA ---
async function eliminarTipoAula(id) {
    if (!confirm("Atenção: Ao eliminar este Tipo de Aula, pode afetar as aulas agendadas com ele! Deseja continuar?")) return;
    
    try {
        const response = await fetchComToken(`${API_TIPO_AULA}/eliminar/${id}`, { 
            method: 'DELETE' 
        });
        
        if (response.ok) {
            alert("Eliminado com sucesso!");
            carregarTiposAula(); // Recarrega a tua tabela
        } else {
            const erroMsg = await response.text();
            alert("Erro ao eliminar: " + erroMsg);
        }
    } catch (error) {
        console.error("Erro no fetch eliminar Tipo Aula:", error);
    }
}

//#endregion
//#region MODALIDADES
// ==========================================
//  CRUD DE MODALIDADES E FORMS
// ==========================================

// --- LISTAR MODALIDADES ---
async function carregarModalidadesGeral() {
  try {
    const response = await fetchComToken(`${API_MODALIDADE}/modalidades`);
    if (!response.ok) throw new Error("Erro ao procurar modalidades");

    let lista = await response.json();
    
    // ORDENAÇÃO: Ordena do menor ID para o maior
    lista.sort((a, b) => a.idModalidade - b.idModalidade);

    const tbody = document.querySelector("#tabela-modalidades tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    lista.forEach((m) => {
      tbody.innerHTML += `
        <tr>
            <td>${m.idModalidade}</td>
            <td><strong>${m.descricao}</strong></td>
            <td>
                <a href="../forms/form_modalidades.html?id=${m.idModalidade}" class="btn btn-dark p-2">
                    <i class="fa fa-pencil"></i>
                </a>
                <button class="btn btn-dark p-2" onclick="eliminarModalidade(${m.idModalidade})">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Erro ao carregar lista de modalidades:", error);
  }
}

// --- GUARDAR MODALIDADE ---
async function guardarModalidade(event) {
    event.preventDefault();

    const idVal = document.getElementById("idModalidade").value;
    
    const payload = {
        idModalidade: idVal ? parseInt(idVal) : null,
        descricao: document.getElementById("descricao").value
    };

    try {
        const response = await fetchComToken(`${API_MODALIDADE}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Modalidade guardada com sucesso!");
            window.location.href = "../gestao/gestao_modalidades.html"; 
        } else {
            const erroTexto = await response.text();
            alert("Erro ao guardar: " + erroTexto);
        }
    } catch (error) {
        console.error("Erro no fetch guardar modalidade:", error);
    }
}

// --- EDITAR MODALIDADE ---
async function editarModalidade(id) {
    try {
        const response = await fetchComToken(`${API_MODALIDADE}/modalidades/${id}`);
        if (!response.ok) throw new Error("Erro ao carregar a Modalidade.");
        
        const dados = await response.json();

        document.getElementById("idModalidade").value = dados.idModalidade;
        document.getElementById("descricao").value = dados.descricao;

    } catch (error) {
        console.error("Erro a carregar para edição:", error);
    }
}

// --- ELIMINAR MODALIDADE ---
async function eliminarModalidade(id) {
    if (!confirm("Atenção: Eliminar uma modalidade pode afetar outras ações! Deseja mesmo continuar?")) return;
    
    try {
        const response = await fetchComToken(`${API_MODALIDADE}/eliminar/${id}`, { 
            method: 'DELETE' 
        });
        
        if (response.ok) {
            alert("Modalidade eliminada com sucesso!");
            carregarModalidadesGeral(); // Recarrega a tabela
        } else {
            const erroMsg = await response.text();
            alert("Não é possível eliminar: " + erroMsg);
        }
    } catch (error) {
        console.error("Erro no fetch eliminar modalidade:", error);
    }
}

//CRUD MODALIDADE-DOCENTE
// FUNÇÃO 2: Carrega a tabela de relação Modalidade <-> Docente
async function carregarModalidadesDocente() {
  try {
    const response = await fetchComToken(`${API_MODALIDADE}/modalidade-docente`);
    if (!response.ok) throw new Error("Erro na resposta do servidor");

    const lista = await response.json();
    // ORDENAÇÃO: Ordena do menor ID para o maior
    lista.sort((a, b) => a.id - b.id);

    const tbody = document.querySelector("#tabela-modalidades-docente tbody");

    if (!tbody) return;
    tbody.innerHTML = "";

    lista.forEach((item) => {
      // Verifica se os objetos existem antes de tentar ler a descrição/nome
      const nomeModalidade = item.modalidade ? item.modalidade.descricao : "N/A";
      
      // A MAGIA AQUI: Junta o nome e o apelido. O '|| ""' evita que escreva "undefined" se não houver apelido.
      const nomeDocente = item.docente ? `${item.docente.nome} ${item.docente.apelido || ""}`.trim() : "N/A";

      tbody.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${nomeModalidade}</td>
                    <td>${nomeDocente}</td>
                    <td>
                        <a href="../forms/form_modalidadedocente.html?id=${item.id}" class="btn btn-dark p-2">
                            <i class="fa fa-pencil"></i>
                        </a>
                        <button class="btn btn-dark p-2" onclick="eliminarModalidadeDocente(${item.id})">
                            <i class="fa fa-trash"></i>
                    </button>
                    </td>
                </tr>
            `;
    });
  } catch (error) {
    console.error("Erro ao carregar atribuições de docentes:", error);
  }
}

let listaGlobalDocentes = []; // Guardamos os docentes aqui para não ter de ir à BD sempre que se muda o Select

// --- 1. CARREGAR OPÇÕES DOS SELECTS ---
async function carregarOpcoesModalidadeDocente() {
    try {
        // Carregar Modalidades
        const respMod = await fetchComToken(`${API_MODALIDADE}/modalidades`);
        const modalidades = await respMod.json();
        const selectMod = document.getElementById("id_modalidade");
        
        modalidades.forEach(m => {
            selectMod.innerHTML += `<option value="${m.idModalidade}">${m.descricao}</option>`;
        });

        // Carregar TODOS os Docentes e guardar na memória (Ajusta o URL se o teu API_DOCENTES for diferente)
        const respDoc = await fetchComToken(`${API_URL}/docentes`); 
        listaGlobalDocentes = await respDoc.json();

    } catch (error) {
        console.error("Erro ao carregar opções:", error);
    }
}

// --- 2. A TUA IDEIA MAGNÍFICA: ATIVAR O SELECT DOS DOCENTES ---
function ativarSelectDocentes() {
    const selectMod = document.getElementById("id_modalidade");
    const selectDoc = document.getElementById("id_docente");

    if (selectMod.value !== "") {
        // Desbloqueia e preenche com os professores
        selectDoc.disabled = false;
        selectDoc.innerHTML = `<option value="">2º Selecione o Professor...</option>`;
        listaGlobalDocentes.forEach(d => {
            selectDoc.innerHTML += `<option value="${d.idDocente}">${d.nome} ${d.apelido || ''}</option>`;
        });
    } else {
        // Bloqueia novamente se a modalidade ficar vazia
        selectDoc.disabled = true;
        selectDoc.innerHTML = `<option value="">2º Aguardando Modalidade...</option>`;
    }
}

// --- 3. GUARDAR ATRIBUIÇÃO ---
async function guardarModalidadeDocente(event) {
    event.preventDefault();

    const idAtribuicao = document.getElementById("id_atribuicao").value;
    
    // O Java espera Objetos para as relações, por isso enviamos assim:
    const payload = {
        id: idAtribuicao ? parseInt(idAtribuicao) : null,
        modalidade: { idModalidade: parseInt(document.getElementById("id_modalidade").value) },
        docente: { idDocente: parseInt(document.getElementById("id_docente").value) }
    };

    try {
        const response = await fetchComToken(`${API_MODALIDADE}/modalidade-docente/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Professor associado à modalidade com sucesso!");
            window.location.href = "../gestao/gestao_modalidades.html"; 
        } else {
            const erroTexto = await response.text();
            alert("Erro ao guardar: " + erroTexto);
        }
    } catch (error) {
        console.error("Erro no fetch:", error);
    }
}

// --- 4. EDITAR ATRIBUIÇÃO ---
async function editarModalidadeDocente(id) {
    try {
        const response = await fetchComToken(`${API_MODALIDADE}/modalidade-docente/${id}`);
        if (!response.ok) throw new Error("Erro ao carregar atribuição.");
        
        const dados = await response.json();

        // 1. Preenche o ID escondido
        document.getElementById("id_atribuicao").value = dados.id;
        
        // 2. Preenche a modalidade
        document.getElementById("id_modalidade").value = dados.modalidade.idModalidade;
        
        // 3. Força a ativação do Select do Professor
        ativarSelectDocentes();
        
        // 4. Preenche o Professor
        document.getElementById("id_docente").value = dados.docente.idDocente;


    } catch (error) {
        console.error("Erro a carregar para edição:", error);
    }
}

// --- 5. ELIMINAR ATRIBUIÇÃO ---
async function eliminarModalidadeDocente(id) {
    if (!confirm("Remover este professor da modalidade?")) return;
    
    try {
        const response = await fetchComToken(`${API_MODALIDADE}/modalidade-docente/eliminar/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            alert("Atribuição removida com sucesso!");
            carregarModalidadesDocente(); // Assumindo que é esta a função que lista na tabela
        } else {
            alert("Erro ao remover: " + await response.text());
        }
    } catch (error) {
        console.error("Erro ao eliminar:", error);
    }
}
//#endregion
//#region PRESENCAS
// ==========================================
//  CRUD DE PRESENÇAS E FORMS
// ==========================================

async function carregarPresencas() {
  try {
        // 1. Carregar as presenças
        const response = await fetchComToken(`${API_PRESENCAS}/presencas`);
        let presencas = await response.json();

        // 2. NOVA MAGIA: Carregar as Modalidades para cruzar o ID com o Nome!
        const respModalidades = await fetchComToken(`${API_MODALIDADE}/modalidades`);
        const modalidades = respModalidades.ok ? await respModalidades.json() : [];

        const selectFiltro = document.getElementById("filtro-modalidade");
        if (selectFiltro) {
            selectFiltro.innerHTML = '<option value="todas">Todas as Modalidades</option>';
            modalidades.forEach(m => {
                // Colocamos o valor em minúsculas para o filtro não falhar com maiúsculas/minúsculas
                selectFiltro.innerHTML += `<option value="${m.descricao.toLowerCase()}">${m.descricao}</option>`;
            });
        }

        const tbody = document.querySelector("#tabela-presencas tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (presencas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum registo de presenças encontrado.</td></tr>`;
            return;
        }

        // Ordenar da mais recente para a mais antiga
        presencas.sort((a, b) => b.idPresenca - a.idPresenca);

        presencas.forEach(p => {
            // --- TRADUÇÃO DOS NOMES ---
            const nomeDocente = p.docente ? `${p.docente.nome} ${p.docente.apelido || ''}`.trim() : "Sem Docente";
            const nomeAluno = p.encarregado ? `${p.encarregado.nomeAluno || 'Aluno'} ${p.encarregado.apelidoAluno || ''}`.trim() : "Sem Aluno";

            // --- A MAGIA DA AULA COM MODALIDADE ---
            let detalhesAula = `<span class="text-muted">Aula Desconhecida</span>`;
            if (p.aula) {
                // Descobrir o nome da Modalidade
                let nomeModalidade = "Modalidade Desconhecida";
                if (p.aula.idModalidade) {
                    const modEncontrada = modalidades.find(m => m.idModalidade === p.aula.idModalidade);
                    if (modEncontrada) nomeModalidade = modEncontrada.descricao;
                }

                // Formatar Data e Hora
                const dataFormatada = p.aula.dataAula ? p.aula.dataAula.split('-').reverse().join('/') : "?";
                const horaFormatada = p.aula.horaInicio ? p.aula.horaInicio.substring(0, 5) : "?";
                
                // Construir a célula rica com Modalidade adicionada!
                detalhesAula = `
                    <strong>ID: ${p.aula.idAula} - ${nomeModalidade}</strong><br>
                    <small class="text-muted"><i class="fa fa-calendar"></i> ${dataFormatada} às <i class="fa fa-clock-o"></i> ${horaFormatada}</small>
                `;
            }

            // --- BADGES DE ESTADO ---
            let corEstado = "badge-outline-secondary";
            if (p.estado) {
                const est = p.estado.toLowerCase();
                if (est.includes("presente") || est === "sim") corEstado = "badge-outline-success";
                else if (est.includes("falta") || est.includes("ausente") || est === "não") corEstado = "badge-outline-danger";
                else if (est.includes("justificad")) corEstado = "badge-outline-warning";
            }
            const badgeEstado = `<span class="badge ${corEstado}">${p.estado || 'Indefinido'}</span>`;

            // --- INJETAR NA TABELA ---
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.idPresenca}</td>
                <td>${nomeDocente}</td>
                <td>${nomeAluno}</td>
                <td>${detalhesAula}</td>
                <td>${badgeEstado}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar o histórico de presenças:", error);
    }
}

function filtrarPresencas() {
    const filtro = document.getElementById("filtro-modalidade").value.toLowerCase();
    const linhas = document.querySelectorAll("#tabela-presencas tbody tr");

    linhas.forEach(tr => {
        // Ignora a linha de "Nenhum registo encontrado" se existir
        if (tr.cells.length === 1) return;

        // A modalidade está escrita na Coluna 4 (que no array é a posição 3), onde metemos os Detalhes da Aula
        const colunaDetalhes = tr.cells[3].textContent.toLowerCase();

        if (filtro === "todas") {
            tr.style.display = ""; // Mostra tudo
        } else if (colunaDetalhes.includes(filtro)) {
            tr.style.display = ""; // Mostra se o nome da modalidade estiver lá pelo meio
        } else {
            tr.style.display = "none"; // Esconde
        }
    });
}

//#endregion
//#region INSCRICOES
// ==========================================
//  CRUD DE INSCRIÇÕES E FORMS
// ==========================================

// --- 1. LISTAR NA TABELA ---
async function carregarInscricoes() {
  try {
    const response = await fetchComToken(`${API_INSCRICOES}/inscricoes`);
    const lista = await response.json();

    // Ordenação do menor para o maior ID
    lista.sort((a, b) => a.idInscricao - b.idInscricao);

    const tbody = document.querySelector("#tabela-inscricoes tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">N/A - Nenhuma inscrição encontrada</td></tr>`;
      return;
    }

    lista.forEach((i) => {
      // AQUI ESTAVA O ERRO! Tinha .nome e .apelido. 
      // Mudei para .nomeAluno e .apelidoAluno para bater certo com o teu Java!
      const nomeAluno = i.encarregado ? `${i.encarregado.nomeAluno} ${i.encarregado.apelidoAluno || ""}`.trim() : "N/A";
      
      const nomeModalidade = i.modalidade ? i.modalidade.descricao : "N/A";

      tbody.innerHTML += `
        <tr>
            <td>${i.idInscricao}</td>
            <td>${nomeAluno}</td>
            <td>${nomeModalidade}</td>
            <td>
                <a href="../forms/form_inscricoes.html?id=${i.idInscricao}" class="btn btn-dark p-2">
                    <i class="fa fa-pencil"></i>
                </a>
                <button class="btn btn-dark p-2" onclick="eliminarInscricao(${i.idInscricao})">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Erro ao carregar inscrições:", error);
  }
}

// Variável global para guardar as modalidades na memória
let listaGlobalModalidadesInscricao = []; 

// --- 2. CARREGAR OPÇÕES (Modificado) ---
async function carregarOpcoesInscricao() {
    try {
        // Carregar Modalidades e guardar na memória (sem preencher o select ainda)
        const respMod = await fetchComToken(`${API_MODALIDADE}/modalidades`);
        listaGlobalModalidadesInscricao = await respMod.json();

        // Carregar Alunos e preencher o primeiro select
        const respAlunos = await fetchComToken(`${API_URL}/alunos`); 
        const alunos = await respAlunos.json();
        console.log("DADOS DOS ALUNOS:", alunos);
        const selectAlunos = document.getElementById("id_encarregado");
        
        selectAlunos.innerHTML = `<option value="">1º Selecione o Aluno...</option>`;
        alunos.forEach(a => {
            selectAlunos.innerHTML += `<option value="${a.idEncEducacao}">${a.nomeAluno} ${a.apelidoAluno || ''}</option>`;
        });

    } catch (error) {
        console.error("Erro ao carregar selects de inscrição:", error);
    }
}

// --- 2.5 A FUNÇÃO DE DESBLOQUEIO ---
function ativarSelectModalidades() {
    const selectAluno = document.getElementById("id_encarregado");
    const selectMod = document.getElementById("id_modalidade");

    if (selectAluno.value !== "") {
        // Se escolheu um aluno, liberta as modalidades!
        selectMod.disabled = false;
        selectMod.innerHTML = `<option value="">2º Selecione a Modalidade...</option>`;
        listaGlobalModalidadesInscricao.forEach(m => {
            selectMod.innerHTML += `<option value="${m.idModalidade}">${m.descricao}</option>`;
        });
    } else {
        // Se voltou a meter "Selecione o Aluno", volta a bloquear
        selectMod.disabled = true;
        selectMod.innerHTML = `<option value="">2º Aguardando Aluno...</option>`;
    }
}

// --- 4. EDITAR INSCRIÇÃO (Modificado para suportar o desbloqueio) ---
async function editarInscricao(id) {
    try {
        const response = await fetchComToken(`${API_INSCRICOES}/inscricoes/${id}`);
        if (!response.ok) throw new Error("Erro ao carregar a Inscrição.");
        
        const i = await response.json();

        document.getElementById("id_inscricao").value = i.idInscricao;
        
        if (i.encarregado) {
            document.getElementById("id_encarregado").value = i.encarregado.idEncEducacao;
            // IMPORTANTE: Obriga as modalidades a desbloquear antes de preencher
            ativarSelectModalidades(); 
        }
        
        if (i.modalidade) {
            document.getElementById("id_modalidade").value = i.modalidade.idModalidade;
        }

    } catch (error) {
        console.error("Erro a carregar para edição:", error);
    }
}

// --- GUARDAR INSCRIÇÃO ---
async function guardarInscricao(event) {
    event.preventDefault();

    // 1. Lemos os valores do ecrã
    const idVal = document.getElementById("id_inscricao").value;
    const idAluno = document.getElementById("id_encarregado").value;
    const idModalidade = document.getElementById("id_modalidade").value;

    // 2. Pequena validação de segurança para garantir que ninguém grava em branco
    if (!idAluno || !idModalidade) {
        alert("Por favor, selecione o Aluno e a Modalidade!");
        return;
    }

    // 3. Construímos o pacote de dados EXATAMENTE como o Java espera
    const payload = {
        idInscricao: idVal ? parseInt(idVal) : null,
        encarregado: { idEncEducacao: parseInt(idAluno) },
        modalidade: { idModalidade: parseInt(idModalidade) }
    };

    try {
        const response = await fetchComToken(`${API_INSCRICOES}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Inscrição guardada com sucesso!");
            // Redireciona o utilizador de volta para a tabela
            window.location.href = "../gestao/gestao_inscricoes.html"; 
        } else {
            const erroTexto = await response.text();
            alert("Erro ao guardar a inscrição: " + erroTexto);
        }
    } catch (error) {
        console.error("Erro no fetch guardar Inscrição:", error);
    }
}

// --- 5. ELIMINAR INSCRIÇÃO ---
async function eliminarInscricao(id) {
    if (!confirm("Tem a certeza que deseja eliminar esta inscrição?")) return;
    
    try {
        const response = await fetchComToken(`${API_INSCRICOES}/eliminar/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            alert("Inscrição eliminada!");
            carregarInscricoes(); // Atualiza a tabela
        } else {
            alert("Erro ao eliminar: " + await response.text());
        }
    } catch (error) {
        console.error("Erro no fetch eliminar Inscrição:", error);
    }
}
//#endregion
//#region ATRIBUICOES
// ==========================================
//  CRUD DE ATRIBUICAOES
// ==========================================

let cacheEncarregadosAluguer = [];
let cacheArtefactosAluguer = [];

function formatarDataAluguerAdmin(valor) {
    if (!valor) return "—";
    const s = String(valor);
    if (s.includes("T")) return s.split("T")[0].split("-").reverse().join("/");
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10).split("-").reverse().join("/");
    return s;
}

function formatarHoraAdmin(hora) {
    if (!hora) return "";
    if (typeof hora === "string") return hora.substring(0, 5);
    if (typeof hora === "object" && hora.hour !== undefined) {
        const h = String(hora.hour).padStart(2, "0");
        const m = String(hora.minute ?? 0).padStart(2, "0");
        return `${h}:${m}`;
    }
    return String(hora).substring(0, 5);
}

function formatarDataHoraCoachingAdmin(aula) {
    const data = formatarDataAluguerAdmin(aula?.dia);
    const inicio = formatarHoraAdmin(aula?.horaInicio);
    const fim = formatarHoraAdmin(aula?.horaFim);
    if (data === "—") return "—";
    if (inicio && fim) return `${data} · ${inicio}–${fim}`;
    if (inicio) return `${data} · ${inicio}`;
    return data;
}

function nomeEncarregadoAluguer(idEnc) {
    const enc = cacheEncarregadosAluguer.find((e) => e.idEncEducacao === idEnc);
    if (!enc) return `ID ${idEnc}`;
    return `${enc.nomeEncEducacao || ""} ${enc.apelidoEncEducacao || ""}`.trim() +
        (enc.nomeAluno ? ` (Aluno: ${enc.nomeAluno})` : "");
}

function descricaoArtefactoAluguer(idArt) {
    const art = cacheArtefactosAluguer.find((a) => a.id === idArt);
    return art ? `${art.descricao} (${art.categoria || "—"})` : `Peça #${idArt}`;
}

async function carregarAtribuicoesAluguer() {
    try {
        const [respPend, respAct, respEnc, respItens] = await Promise.all([
            fetchComToken(`${API_INVENTARIO}/alugueres/pendentes`),
            fetchComToken(`${API_INVENTARIO}/alugueres/ativos`),
            fetchComToken(`${API_URL}/alunos`),
            fetchComToken(`${API_INVENTARIO}/itens`),
        ]);

        if (!respPend.ok || !respAct.ok) {
            const msg = !respPend.ok
                ? "A API de alugueres ainda não está disponível. Confirme que o backend foi atualizado e publicado."
                : "Não foi possível carregar alugueres ativos.";
            const tbodyPend = document.getElementById("tabela-aluguer-pendentes");
            const tbodyAct = document.getElementById("tabela-aluguer-ativos");
            if (tbodyPend) tbodyPend.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${msg}</td></tr>`;
            if (tbodyAct) tbodyAct.innerHTML = `<tr><td colspan="4" class="text-center text-muted">—</td></tr>`;
            return;
        }

        let pendentes = await respPend.json();
        const activos = await respAct.json();
        cacheEncarregadosAluguer = respEnc.ok ? await respEnc.json() : [];
        cacheArtefactosAluguer = respItens.ok ? await respItens.json() : [];

        // Fallback se /pendentes vier vazio mas existirem pedidos (API antiga ou estado com acentos)
        if (pendentes.length === 0 && cacheEncarregadosAluguer.length > 0) {
            const idsEscola = new Set(
                cacheArtefactosAluguer
                    .filter((a) => a.idDirecao != null && a.idDirecao !== 0)
                    .map((a) => a.id),
            );
            for (const enc of cacheEncarregadosAluguer) {
                if (!enc?.idEncEducacao) continue;
                try {
                    const r = await fetchComToken(
                        `${API_INVENTARIO}/meus-alugueres/${enc.idEncEducacao}`,
                    );
                    if (!r.ok) continue;
                    const lista = await r.json();
                    lista.forEach((p) => {
                        const est = (p.estado || "").toLowerCase();
                        if (
                            est.includes("aguardar") &&
                            est.includes("aprova") &&
                            idsEscola.has(p.idArtefacto) &&
                            !pendentes.some((x) => x.id === p.id)
                        ) {
                            pendentes.push(p);
                        }
                    });
                } catch {
                    /* ignorar */
                }
            }
        }

        const tbodyPend = document.getElementById("tabela-aluguer-pendentes");
        const tbodyAct = document.getElementById("tabela-aluguer-ativos");
        if (!tbodyPend || !tbodyAct) return;

        tbodyPend.innerHTML = "";
        if (pendentes.length === 0) {
            tbodyPend.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Não há pedidos de aluguer pendentes.</td></tr>`;
        } else {
            const contagemPorPeca = {};
            pendentes.forEach((p) => {
                contagemPorPeca[p.idArtefacto] = (contagemPorPeca[p.idArtefacto] || 0) + 1;
            });

            pendentes.forEach((p) => {
                const competicao =
                    contagemPorPeca[p.idArtefacto] > 1
                        ? `<br><small class="text-warning">${contagemPorPeca[p.idArtefacto]} pedidos para esta peça</small>`
                        : "";
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${descricaoArtefactoAluguer(p.idArtefacto)}${competicao}</td>
                    <td>${nomeEncarregadoAluguer(p.idEncEducacao)}</td>
                    <td>${formatarDataAluguerAdmin(p.dataInicio)}</td>
                    <td>${formatarDataAluguerAdmin(p.dataFim)}</td>
                    <td>${p.valor != null ? p.valor + "€" : "—"}</td>
                    <td style="white-space: nowrap;">
                        <button class="btn btn-success text-white btn-sm me-1" onclick="aprovarPedidoAluguer(${p.id})">
                            <i class="fa fa-check"></i> Aceitar
                        </button>
                        <button class="btn btn-danger text-white btn-sm" onclick="recusarPedidoAluguer(${p.id})">
                            <i class="fa fa-times"></i> Recusar
                        </button>
                    </td>
                `;
                tbodyPend.appendChild(tr);
            });
        }

        tbodyAct.innerHTML = "";
        if (activos.length === 0) {
            tbodyAct.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Não há alugueres ativos.</td></tr>`;
        } else {
            activos.forEach((p) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${descricaoArtefactoAluguer(p.idArtefacto)}</td>
                    <td>${nomeEncarregadoAluguer(p.idEncEducacao)}</td>
                    <td>${formatarDataAluguerAdmin(p.dataInicio)} — ${formatarDataAluguerAdmin(p.dataFim)}</td>
                    <td>
                        <button class="btn btn-primary text-white btn-sm" onclick="devolverPedidoAluguer(${p.id})">
                            <i class="fa fa-undo"></i> Marcar devolvido
                        </button>
                    </td>
                `;
                tbodyAct.appendChild(tr);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar atribuições de aluguer:", error);
    }
}

async function aprovarPedidoAluguer(id) {
    const ok = await adminConfirmar(
        "Aprovar pedido",
        "Aprovar este pedido de aluguer? Os outros pedidos pendentes da mesma peça serão recusados automaticamente.",
    );
    if (!ok) return;
    try {
        const response = await fetchComToken(`${API_INVENTARIO}/aluguer/${id}/aprovar`, { method: "PUT" });
        if (response.ok) {
            adminNotificar("Sucesso", "Pedido aprovado com sucesso.", "success");
            carregarAtribuicoesAluguer();
        } else {
            adminNotificar("Erro", await response.text(), "error");
        }
    } catch (e) {
        adminNotificar("Erro", "Erro de ligação ao aprovar o pedido.", "error");
    }
}

async function recusarPedidoAluguer(id) {
    const ok = await adminConfirmar("Recusar pedido", "Tem a certeza que deseja recusar este pedido de aluguer?");
    if (!ok) return;
    try {
        const response = await fetchComToken(`${API_INVENTARIO}/aluguer/${id}/recusar`, { method: "PUT" });
        if (response.ok) {
            adminNotificar("Pedido recusado", "O pedido foi marcado como recusado.", "success");
            carregarAtribuicoesAluguer();
        } else {
            adminNotificar("Erro", await response.text(), "error");
        }
    } catch (e) {
        adminNotificar("Erro", "Erro de ligação ao recusar o pedido.", "error");
    }
}

async function devolverPedidoAluguer(id) {
    const ok = await adminConfirmar(
        "Devolução",
        "Confirmar que a peça foi devolvida à escola? A peça voltará a ficar disponível para aluguer.",
    );
    if (!ok) return;
    try {
        const response = await fetchComToken(`${API_INVENTARIO}/aluguer/${id}/devolver`, { method: "PUT" });
        if (response.ok) {
            adminNotificar("Devolução registada", "Aluguer concluído. A peça está novamente disponível.", "success");
            carregarAtribuicoesAluguer();
        } else {
            adminNotificar("Erro", await response.text(), "error");
        }
    } catch (e) {
        adminNotificar("Erro", "Erro de ligação ao registar a devolução.", "error");
    }
}

window.carregarAtribuicoesAluguer = carregarAtribuicoesAluguer;
window.aprovarPedidoAluguer = aprovarPedidoAluguer;
window.recusarPedidoAluguer = recusarPedidoAluguer;
window.devolverPedidoAluguer = devolverPedidoAluguer;

// ==========================================
//  CRUD DE ATRIBUIÇÕES (APROVAÇÃO DE SALAS)
// ==========================================

async function carregarAtribuicoes() {
    try {
        // 1. Carregar todas as aulas privadas
        const respAulas = await fetchComToken(`${API_AULAS_PRIVADAS}`); // Ajusta o URL se for diferente!
        let aulas = await respAulas.json();

        // 2. Carregar todos os estúdios para criar o select
        const respEstudios = await fetchComToken(`${API_ESTUDIOS}/estudios`);
        const estudios = await respEstudios.json();

        // 3. FILTRO: Queremos apenas as "Pendentes"
        const aulasPendentes = aulas.filter(a => a.estado === "Aguardar Direcao");

        const tbody = document.getElementById("tabela-atribuicoes-body");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (aulasPendentes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Não há pedidos pendentes de momento.</td></tr>`;
            return;
        }

        aulasPendentes.forEach(aula => {
            // Nomes Seguros (Fallback caso não existam)
            const nomeAluno = aula.encEducacao ? `${aula.encEducacao.nomeAluno} ${aula.encEducacao.apelidoAluno || ''}` : `ID Aluno: ${aula.idEncEducacao}`;
            const dataCoaching = formatarDataHoraCoachingAdmin(aula);
            const nomeDocente = aula.docente ? `${aula.docente.nome} ${aula.docente.apelido || ''}` : `ID Docente: ${aula.idDocente}`;
            const nomeFormato = aula.tipoAula ? aula.tipoAula.descricao : `Cód Formato: ${aula.cod_tipoaula}`;
            const nomeEstudioPref = aula.estudio ? `Estúdio ${aula.estudio.idEstudio}` : "Sem preferência";

            // Construir o Dropdown de Estúdios (Pré-selecionando o preferido)
            let opcoesEstudios = `<option value="">Escolha um estúdio...</option>`;
            estudios.forEach(est => {
                const isSelected = (aula.estudio && aula.estudio.idEstudio === est.idEstudio) ? "selected" : "";
                opcoesEstudios += `<option value="${est.idEstudio}" ${isSelected}>Estúdio ${est.idEstudio} (Cap: ${est.alocacao})</option>`;
            });

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${nomeAluno}</strong></td>
                <td><strong>${dataCoaching}</strong></td>
                <td>${nomeDocente}<br><small class="text-muted">${aula.preco}€ / h</small></td>
                <td>${aula.duracao} Min / ${nomeFormato}</td>
                <td>
                    <span style="font-size: 0.95rem; padding: 8px 12px; background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 500;">
                        ${nomeEstudioPref}
                    </span>
                </td>
                <td>
                    <select class="form-select" id="select-estudio-${aula.idAulaPrivada}" style="width: 180px; height: 40px;">
                        ${opcoesEstudios}
                    </select>
                </td>
                <td style="white-space: nowrap;">
                    <button class="btn btn-success text-white" style="min-width: 100px; height: 40px; padding: 8px 15px;" onclick="processarAula(${aula.idAulaPrivada}, 'Agendada')">
                        <i class="fa fa-check"></i> Aprovar
                    </button>
                    <button class="btn btn-danger text-white" style="margin-left: 5px; min-width: 100px; height: 40px; padding: 8px 15px;" onclick="processarAula(${aula.idAulaPrivada}, 'Cancelada')">
                        <i class="fa fa-times"></i> Rejeitar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar as atribuições pendentes:", error);
    }
}

// Função dupla: Serve para Aprovar (Agendada) ou Rejeitar (Cancelada)
async function processarAula(idAulaPrivada, novoEstado) {
    // Se for aprovar, precisamos de saber qual foi o estúdio escolhido no dropdown!
    let idEstudioEscolhido = null;
    
    if (novoEstado === 'Agendada') {
        const selectElement = document.getElementById(`select-estudio-${idAulaPrivada}`);
        if (!selectElement.value) {
            alert("Mestre, precisa de escolher um estúdio definitivo antes de aprovar!");
            return;
        }
        idEstudioEscolhido = parseInt(selectElement.value);
    }

    try {
        // 1. Vamos buscar a aula original para não perder dados (dia, hora, preco, etc)
        // Ajusta o API_URL se for outro endpoint
        const respAula = await fetchComToken(`${API_AULAS_PRIVADAS}/${idAulaPrivada}`);
        if (!respAula.ok) throw new Error("Não foi possível carregar os dados da Aula.");
        const aulaOriginal = await respAula.json();

        // 2. Construímos o pacote exato que o teu Controller Java exige
        const payload = {
            idAulaPrivada: aulaOriginal.idAulaPrivada,
            cod_tipoaula: aulaOriginal.cod_tipoaula, // O teu Java exige isto!
            dia: aulaOriginal.dia,
            horaInicio: aulaOriginal.horaInicio,
            horaFim: aulaOriginal.horaFim,
            preco: aulaOriginal.preco,
            duracao: aulaOriginal.duracao,
            estado: novoEstado, // "Agendada" ou "Cancelada"
            idDocente: aulaOriginal.idDocente,
            idEncEducacao: aulaOriginal.idEncEducacao,
            modalidade: aulaOriginal.modalidade ? { idModalidade: aulaOriginal.modalidade.idModalidade } : null
        };

        // Adiciona o Estúdio (Se foi aprovado, usa o do Dropdown. Se foi rejeitado, mantém o antigo ou manda null)
        if (novoEstado === 'Agendada') {
            payload.estudio = { idEstudio: idEstudioEscolhido };
        } else if (aulaOriginal.estudio) {
            payload.estudio = { idEstudio: aulaOriginal.estudio.idEstudio };
        }

        // 3. Enviar para o Java
        const response = await fetchComToken(`${API_AULAS_PRIVADAS}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Um pequeno feedback visual de sucesso
            alert(novoEstado === 'Agendada' ? "Aula Aprovada e Agendada com sucesso!" : "Aula Rejeitada/Cancelada.");
            carregarAtribuicoes(); // Recarrega a tabela (a aula aprovada vai desaparecer da lista de pendentes)
        } else {
            alert("Erro ao processar a aula: " + await response.text());
        }

    } catch (error) {
        console.error("Erro fatal ao aprovar/rejeitar:", error);
    }
}

//#endregion
//#region FATURACAO DE AULAS PRIVADAS

// ==========================================
//  FATURAÇÃO DE AULAS PRIVADAS (COACHING)
// ==========================================

async function carregarFaturacaoCoaching() {
    try {
        const response = await fetchComToken(`${API_AULAS_PRIVADAS}`);
        const aulas = await response.json();

        // FILTRO: Queremos "Concluída" (Acabou agora) e "Realizada" (Confirmada pelo Enc.)
        // Adicionei "Concluida" sem acento por segurança, caso a BD grave sem acento.
        const aulasParaFaturar = aulas.filter(a => 
            a.estado === "Realizada" || a.estado === "Concluída" || a.estado === "Concluida"
        );

        const tbody = document.getElementById("tabela-faturacao-body");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (aulasParaFaturar.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Não há aulas prontas para faturação.</td></tr>`;
            return;
        }

        aulasParaFaturar.forEach(aula => {
            const valorFaturar = Math.round(aula.preco || 0);
            const dataFormatada = aula.dia ? aula.dia.split('-').reverse().join('/') : "?";
            
            let badgeEstado = "";
            let botaoAcao = "";

            // --- LÓGICA INVERTIDA E CORES NEUTRAS ---
            
            if (aula.estado === "Concluída" || aula.estado === "Concluida") {
                // AULA ACABOU: Aguarda confirmação do Encarregado
                badgeEstado = `
                    <span style="display: inline-block; padding: 5px 10px; background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; font-weight: bold; font-size: 0.85rem; border-radius: 50px; text-transform: uppercase;">Aguardando Confirmação</span>
                    <br><small class="text-muted" style="font-size: 0.75rem; margin-top: 4px; display: inline-block;">(Estado Real: <b>${aula.estado}</b>)</small>
                `;
                
                botaoAcao = `<button style="min-width: 140px; height: 40px; background-color: #f3f4f6; color: #9ca3af; border: 1px solid #e5e7eb; border-radius: 5px; cursor: not-allowed;" disabled title="Aguarde que a presença seja confirmada">Validar Fatura</button>`;
            } 
            else if (aula.estado === "Realizada") {
                // CONFIRMADA: Pronta a faturar!
                badgeEstado = `
                    <span style="display: inline-block; padding: 5px 10px; background-color: #dcfce7; color: #059669; font-weight: bold; font-size: 0.85rem; border-radius: 50px; text-transform: uppercase;">Pronta a Faturar</span>
                    <br><small class="text-muted" style="font-size: 0.75rem; margin-top: 4px; display: inline-block;">(Estado Real: <b>${aula.estado}</b>)</small>
                `;
                
                botaoAcao = `<button class="btn btn-dark" style="min-width: 140px; height: 40px;" onclick="faturarAula(${aula.idAulaPrivada}, ${aula.idEncEducacao}, ${valorFaturar})">Validar Fatura</button>`;
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${dataFormatada}, ${aula.horaInicio.substring(0, 5)}</td>
                <td>${aula.encEducacao ? aula.encEducacao.nomeAluno : 'Aluno'}<br><small class="text-muted">(${aula.tipoAula ? aula.tipoAula.descricao : 'Privada'})</small></td>
                <td>${aula.docente ? aula.docente.nome : 'Coach'}</td>
                <td><strong>${valorFaturar},00 €</strong></td>
                <td>${badgeEstado}</td>
                <td>${botaoAcao}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro na faturação:", error);
    }
}

async function faturarAula(idAulaPrivada, idEncEducacao, valorFinal) {
    if (!confirm(`Deseja converter esta aula em fatura de ${valorFinal}€?`)) return;

    try {
        // 1. Regista o pagamento (Contabilidade)
        await fetchComToken(`${API_PAGAMENTOS}/coaching`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idEncEducacao: idEncEducacao, valor: valorFinal })
        });

        // 2. Muda o estado para Paga (Fecha o ciclo)
        await fetchComToken(`${API_AULAS_PRIVADAS}/${idAulaPrivada}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: "Paga" })
        });

        alert("Fatura Validada! O registo foi enviado para o histórico financeiro.");
        carregarFaturacaoCoaching(); // Atualiza a tabela

    } catch (error) {
        alert("Erro no processo de faturação.");
    }
}

//#endregion
//#region INVENTARIO
// ==========================================
//  CRUD DE INVENTÁRIO FIGURINOS
// ==========================================

async function carregarFigurinos() {
    console.log("PASSO 1: A função carregarFigurinos começou a correr!");
    try {
        // 1. Ir buscar os artefactos
        console.log("PASSO 2: A ir buscar dados à API...", `${API_INVENTARIO}/itens`);
        const respItens = await fetchComToken(`${API_INVENTARIO}/itens`);
        let lista = await respItens.json();
        console.log("PASSO 3: Dados recebidos do Java:", lista);

        // 2. Ir buscar as listas de pessoas
        const respAlunos = await fetchComToken(`${API_URL}/alunos`);
        const alunos = respAlunos.ok ? await respAlunos.json() : [];

        const respDocentes = await fetchComToken(`${API_URL}/docentes`);
        const docentes = respDocentes.ok ? await respDocentes.json() : [];

        const respDirecao = await fetchComToken(`${API_URL}/direcao`); 
        const diretores = respDirecao.ok ? await respDirecao.json() : [];

        // 3. O FILTRO
        lista = lista.filter(item => item.categoria === 'Figurino');
        console.log("PASSO 4: Lista depois de filtrar por 'Figurino':", lista);

        // Ordenação
        lista.sort((a, b) => a.id - b.id);

        const tbody = document.querySelector("#tabela-figurinos tbody");
        console.log("PASSO 5: Tbody encontrado no HTML?", tbody);
        
        if (!tbody) {
            console.log("PAROU AQUI: O JavaScript não encontrou a tabela no HTML!");
            return;
        }

        tbody.innerHTML = "";

        if (lista.length === 0) {
            console.log("PASSO 6: A lista está vazia, a mostrar mensagem de sem dados.");
            tbody.innerHTML = `<tr><td colspan="13" class="text-center text-muted">Nenhum figurino encontrado.</td></tr>`;
            return;
        }

        console.log("PASSO 6: A desenhar a tabela no ecrã...");
        lista.forEach((item) => {
            const imgTag = item.imagem 
                ? `<img src="${item.imagem}" alt="Foto" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` 
                : `<span class="text-muted">Sem Foto</span>`;

            // 1. Aluno
            let nomeDonoAluno = "-";
            if (item.idEncEducacao) {
                const alunoEncontrado = alunos.find(a => a.idEncEducacao === item.idEncEducacao);
                nomeDonoAluno = alunoEncontrado ? `${alunoEncontrado.nomeAluno} ${alunoEncontrado.apelidoAluno || ''}`.trim() : `ID: ${item.idEncEducacao}`;
            }

            // 2. Docente
            let nomeDonoDocente = "-";
            if (item.idDocente) {
                const docenteEncontrado = docentes.find(d => d.idDocente === item.idDocente);
                nomeDonoDocente = docenteEncontrado ? `${docenteEncontrado.nome} ${docenteEncontrado.apelido || ''}`.trim() : `ID: ${item.idDocente}`;
            }

            // 3. Direção
            let nomeDonoGestor = "-";
            if (item.idDirecao) {
                const gestorEncontrado = diretores.find(g => g.idDirecao === item.idDirecao || g.id_direcao === item.idDirecao); 
                nomeDonoGestor = gestorEncontrado ? `${gestorEncontrado.nomegestor || gestorEncontrado.nomeGestor || ''}`.trim() : `ID: ${item.idDirecao}`;
            }

            const corDisponibilidade = item.disponibilidade === 'Disponível' ? 'text-success' : 'text-danger';

            tbody.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td><strong>${item.descricao}</strong></td>
                    <td>${item.estado}</td>
                    <td>${item.tamanho}</td> 
                    <td>${item.precoAluguer} €</td>
                    <td class="fw-bold ${corDisponibilidade}">${item.disponibilidade}</td>
                    <td>${imgTag}</td>
                    <td>${item.categoria}</td>
                    <td>${item.telefone}</td>
                    <td>${nomeDonoAluno}</td>
                    <td>${nomeDonoDocente}</td>
                    <td>${nomeDonoGestor}</td>
                    <td>
                        <a href="../forms/form_inventario.html?id=${item.id}" class="btn btn-dark p-2">
                            <i class="fa fa-pencil"></i>
                        </a>
                        <button class="btn btn-dark p-2" onclick="eliminarArtefacto(${item.id})">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        console.log("PASSO 7: Sucesso! Tabela desenhada.");
    } catch (error) {
        console.error("PAROU AQUI (NO CATCH): Erro ao carregar figurinos:", error);
    }
}

let listaAlunos = [];
let listaDocentes = [];
let listaDirecao = [];

// --- 1. CARREGAR AS LISTAS DE DONOS ---
async function carregarListasDonos() {
    try {
        const respAlunos = await fetchComToken(`${API_URL}/alunos`); // Ajusta para o teu URL base
        if (respAlunos.ok) listaAlunos = await respAlunos.json();

        const respDocentes = await fetchComToken(`${API_URL}/docentes`);
        if (respDocentes.ok) listaDocentes = await respDocentes.json();

        const respDirecao = await fetchComToken(`${API_URL}/direcao`);
        if (respDirecao.ok) listaDirecao = await respDirecao.json();
    } catch (error) {
        console.error("Erro ao carregar listas de donos:", error);
    }
}

// --- 2. O TRUQUE DOS DROPDOWNS DINÂMICOS ---
function mudarTipoDono() {
    const tipo = document.getElementById("tipo_dono").value;
    const selectFinal = document.getElementById("id_dono_final");

    selectFinal.innerHTML = `<option value="">Selecione o Proprietário...</option>`;

    if (tipo === "") {
        selectFinal.disabled = true;
        return;
    }

    selectFinal.disabled = false;

    if (tipo === "aluno") {
        listaAlunos.forEach(a => {
            selectFinal.innerHTML += `<option value="${a.idEncEducacao}">${a.nomeAluno} ${a.apelidoAluno || ''}</option>`;
        });
    } else if (tipo === "docente") {
        listaDocentes.forEach(d => {
            selectFinal.innerHTML += `<option value="${d.idDocente}">${d.nome} ${d.apelido || ''}</option>`;
        });
    } else if (tipo === "direcao") {
        listaDirecao.forEach(g => {
            selectFinal.innerHTML += `<option value="${g.idDirecao || g.id_direcao}">${g.nomegestor || g.nomeGestor || 'Gestor'}</option>`;
        });
    }
}

// --- 3. CONVERTER A IMAGEM PARA BASE64 ---
function converterImagemBase64(inputElement) {
    const ficheiro = inputElement.files[0];
    const preview = document.getElementById("preview_imagem");
    const inputBase64 = document.getElementById("imagem_base64");
    const infoNome = document.getElementById("nome_ficheiro");

    if (ficheiro) {
        infoNome.value = ficheiro.name; // Escreve o nome da foto no input bonito
        
        const reader = new FileReader();
        reader.onloadend = function () {
            inputBase64.value = reader.result;
            preview.src = reader.result;
            preview.style.display = "block"; // Mostra a imagem
        };
        reader.readAsDataURL(ficheiro);
    } else {
        infoNome.value = "";
        preview.src = "";
        preview.style.display = "none";
        inputBase64.value = "";
    }
}

// --- 4. GUARDAR ARTEFACTO ---
async function guardarArtefacto(event) {
    event.preventDefault();

    const idVal = document.getElementById("id_artefacto").value;
    const tipoDono = document.getElementById("tipo_dono").value;
    const idDonoFinal = document.getElementById("id_dono_final").value;

    // Enviar apenas o ID certo e anular os outros (Para o Java ficar feliz)
    let enviaAluno = null, enviaDocente = null, enviaDirecao = null;
    
    if (idDonoFinal !== "") {
        if (tipoDono === "aluno") enviaAluno = parseInt(idDonoFinal);
        if (tipoDono === "docente") enviaDocente = parseInt(idDonoFinal);
        if (tipoDono === "direcao") enviaDirecao = parseInt(idDonoFinal);
    }

    const payload = {
        id: idVal ? parseInt(idVal) : null,
        descricao: document.getElementById("descricao").value,
        categoria: document.getElementById("categoria").value,
        tamanho: document.getElementById("tamanho").value,
        estado: document.getElementById("estado").value,
        telefone: document.getElementById("telefone").value,
        precoAluguer: parseInt(document.getElementById("preco_aluguer").value),
        disponibilidade: document.getElementById("disponibilidade").value,
        imagem: document.getElementById("imagem_base64").value,
        
        // As tuas antigas variáveis Integer!
        idEncEducacao: enviaAluno,
        idDocente: enviaDocente,
        idDirecao: enviaDirecao
    };

    try {
        // Se usar API_INVENTARIO, confirma que a variável está criada no topo do teu ficheiro!
        const endpoint = idVal ? `${API_INVENTARIO}/itens2/${idVal}` : `${API_INVENTARIO}/itens`;
        const metodo = idVal ? 'PUT' : 'POST';

        const response = await fetchComToken(endpoint, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Artigo guardado com sucesso!");
            window.location.href = "../inventario/inventario_todos.html"; // Redireciona
        } else {
            alert("Erro ao guardar: " + await response.text());
        }
    } catch (error) {
        console.error("Erro no fetch guardar:", error);
    }
}

// --- 5. EDITAR ARTEFACTO (Preencher o form) ---
async function editarArtefacto(id) {
    try {
        const response = await fetchComToken(`${API_INVENTARIO}/itens/${id}`); 
        if (!response.ok) throw new Error("Erro ao carregar a peça.");
        
        const item = await response.json();

        document.getElementById("id_artefacto").value = item.id;
        document.getElementById("descricao").value = item.descricao;
        document.getElementById("categoria").value = item.categoria;
        document.getElementById("tamanho").value = item.tamanho;
        document.getElementById("estado").value = item.estado;
        document.getElementById("telefone").value = item.telefone;
        document.getElementById("preco_aluguer").value = item.precoAluguer;
        
        // Verifica se existe disponibilidade para preencher
        if (item.disponibilidade) {
            document.getElementById("disponibilidade").value = item.disponibilidade;
        }

        if (item.imagem) {
            document.getElementById("imagem_base64").value = item.imagem;
            const preview = document.getElementById("preview_imagem");
            preview.src = item.imagem;
            preview.style.display = "block";
            document.getElementById("nome_ficheiro").value = "Imagem Carregada Previamente";
        }

        const selectTipo = document.getElementById("tipo_dono");
        const selectDonoFinal = document.getElementById("id_dono_final");

        if (item.idEncEducacao) {
            selectTipo.value = "aluno";
            mudarTipoDono(); 
            selectDonoFinal.value = item.idEncEducacao;
        } else if (item.idDocente) {
            selectTipo.value = "docente";
            mudarTipoDono(); 
            selectDonoFinal.value = item.idDocente;
        } else if (item.idDirecao) {
            selectTipo.value = "direcao";
            mudarTipoDono(); 
            selectDonoFinal.value = item.idDirecao;
        }

    } catch (error) {
        console.error("Erro a carregar para edição:", error);
    }
}

// ==========================================
//  CRUD DE INVENTÁRIO ACESSÓRIOS
// ==========================================

async function carregarAcessorios() {
    try {
        // 1. Ir buscar os artefactos
        const respItens = await fetchComToken(`${API_INVENTARIO}/itens`);
        let lista = await respItens.json();

        // 2. Ir buscar as listas de pessoas para traduzir os IDs em Nomes
        const respAlunos = await fetchComToken(`${API_URL}/alunos`);
        const alunos = respAlunos.ok ? await respAlunos.json() : [];

        const respDocentes = await fetchComToken(`${API_URL}/docentes`);
        const docentes = respDocentes.ok ? await respDocentes.json() : [];

        const respDirecao = await fetchComToken(`${API_URL}/direcao`); 
        const diretores = respDirecao.ok ? await respDirecao.json() : [];

        // 3. O FILTRO: Queremos apenas "Acessório" (Tem de estar escrito igual ao valor que guardas!)
        lista = lista.filter(item => item.categoria === 'Acessório');

        // Ordenação do menor para o maior ID
        lista.sort((a, b) => a.id - b.id);

        // Procura a tabela de acessórios
        const tbody = document.querySelector("#tabela-acessorios tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="13" class="text-center text-muted">Nenhum acessório encontrado.</td></tr>`;
            return;
        }

        lista.forEach((item) => {
            // A MAGIA DA IMAGEM
            const imgTag = item.imagem 
                ? `<img src="${item.imagem}" alt="Foto" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` 
                : `<span class="text-muted">Sem Foto</span>`;

            // --- TRADUÇÃO DOS IDs PARA NOMES ---
            let nomeDonoAluno = "-";
            if (item.encarregado) {
                nomeDonoAluno = `${item.encarregado.nomeAluno} ${item.encarregado.apelidoAluno || ''}`.trim();
            } else if (item.idEncEducacao) { // Fallback de segurança
                const alunoEncontrado = alunos.find(a => a.idEncEducacao === item.idEncEducacao);
                nomeDonoAluno = alunoEncontrado ? `${alunoEncontrado.nomeAluno} ${alunoEncontrado.apelidoAluno || ''}`.trim() : `ID: ${item.idEncEducacao}`;
            }

            let nomeDonoDocente = "-";
            if (item.docente) {
                nomeDonoDocente = `${item.docente.nome} ${item.docente.apelido || ''}`.trim();
            } else if (item.idDocente) {
                const docenteEncontrado = docentes.find(d => d.idDocente === item.idDocente);
                nomeDonoDocente = docenteEncontrado ? `${docenteEncontrado.nome} ${docenteEncontrado.apelido || ''}`.trim() : `ID: ${item.idDocente}`;
            }

            let nomeDonoGestor = "-";
            if (item.direcao) {
                nomeDonoGestor = `${item.direcao.nomegestor || item.direcao.nomeGestor || ''}`.trim();
            } else if (item.idDirecao) {
                const gestorEncontrado = diretores.find(g => g.idDirecao === item.idDirecao || g.id_direcao === item.idDirecao); 
                nomeDonoGestor = gestorEncontrado ? `${gestorEncontrado.nomegestor || gestorEncontrado.nomeGestor || ''}`.trim() : `ID: ${item.idDirecao}`;
            }

            const corDisponibilidade = item.disponibilidade === 'Disponível' ? 'text-success' : 'text-danger';

            tbody.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td><strong>${item.descricao}</strong></td>
                    <td>${item.estado}</td>
                    <td>${item.tamanho}</td> 
                    <td>${item.precoAluguer} €</td>
                    <td class="fw-bold ${corDisponibilidade}">${item.disponibilidade}</td>
                    <td>${imgTag}</td>
                    <td>${item.categoria}</td>
                    <td>${item.telefone}</td>
                    <td>${nomeDonoAluno}</td>
                    <td>${nomeDonoDocente}</td>
                    <td>${nomeDonoGestor}</td>
                    <td>
                        <a href="../forms/form_inventario.html?id=${item.id}" class="btn btn-dark p-2">
                            <i class="fa fa-pencil"></i>
                        </a>
                        <button class="btn btn-dark p-2" onclick="eliminarArtefacto(${item.id})">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar acessórios:", error);
    }
}


// ==========================================
//  CRUD DE INVENTÁRIO CENÁRIOS
// ==========================================

async function carregarCenarios() {
    try {
        // 1. Ir buscar os artefactos
        const respItens = await fetchComToken(`${API_INVENTARIO}/itens`);
        let lista = await respItens.json();

        // 2. Ir buscar as listas de pessoas para traduzir os IDs em Nomes
        const respAlunos = await fetchComToken(`${API_URL}/alunos`);
        const alunos = respAlunos.ok ? await respAlunos.json() : [];

        const respDocentes = await fetchComToken(`${API_URL}/docentes`);
        const docentes = respDocentes.ok ? await respDocentes.json() : [];

        const respDirecao = await fetchComToken(`${API_URL}/direcao`); 
        const diretores = respDirecao.ok ? await respDirecao.json() : [];

        // 3. O FILTRO: Queremos apenas "Cenário"
        lista = lista.filter(item => item.categoria === 'Cenário');

        // Ordenação do menor para o maior ID
        lista.sort((a, b) => a.id - b.id);

        const tbody = document.querySelector("#tabela-cenarios tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="13" class="text-center text-muted">Nenhum cenário encontrado no inventário.</td></tr>`;
            return;
        }

        lista.forEach((item) => {
            // A MAGIA DA IMAGEM
            const imgTag = item.imagem 
                ? `<img src="${item.imagem}" alt="Foto" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` 
                : `<span class="text-muted">Sem Foto</span>`;

            // --- TRADUÇÃO DOS IDs PARA NOMES ---
            let nomeDonoAluno = "-";
            if (item.encarregado) {
                nomeDonoAluno = `${item.encarregado.nomeAluno} ${item.encarregado.apelidoAluno || ''}`.trim();
            } else if (item.idEncEducacao) {
                const alunoEncontrado = alunos.find(a => a.idEncEducacao === item.idEncEducacao);
                nomeDonoAluno = alunoEncontrado ? `${alunoEncontrado.nomeAluno} ${alunoEncontrado.apelidoAluno || ''}`.trim() : `ID: ${item.idEncEducacao}`;
            }

            let nomeDonoDocente = "-";
            if (item.docente) {
                nomeDonoDocente = `${item.docente.nome} ${item.docente.apelido || ''}`.trim();
            } else if (item.idDocente) {
                const docenteEncontrado = docentes.find(d => d.idDocente === item.idDocente);
                nomeDonoDocente = docenteEncontrado ? `${docenteEncontrado.nome} ${docenteEncontrado.apelido || ''}`.trim() : `ID: ${item.idDocente}`;
            }

            let nomeDonoGestor = "-";
            if (item.direcao) {
                nomeDonoGestor = `${item.direcao.nomegestor || item.direcao.nomeGestor || ''}`.trim();
            } else if (item.idDirecao) {
                const gestorEncontrado = diretores.find(g => g.idDirecao === item.idDirecao || g.id_direcao === item.idDirecao); 
                nomeDonoGestor = gestorEncontrado ? `${gestorEncontrado.nomegestor || gestorEncontrado.nomeGestor || ''}`.trim() : `ID: ${item.idDirecao}`;
            }

            const corDisponibilidade = item.disponibilidade === 'Disponível' ? 'text-success' : 'text-danger';

            tbody.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td><strong>${item.descricao}</strong></td>
                    <td>${item.estado}</td>
                    <td>${item.tamanho}</td> 
                    <td>${item.precoAluguer} €</td>
                    <td class="fw-bold ${corDisponibilidade}">${item.disponibilidade}</td>
                    <td>${imgTag}</td>
                    <td>${item.categoria}</td>
                    <td>${item.telefone}</td>
                    <td>${nomeDonoAluno}</td>
                    <td>${nomeDonoDocente}</td>
                    <td>${nomeDonoGestor}</td>
                    <td>
                        <a href="../forms/form_inventario.html?id=${item.id}" class="btn btn-dark p-2">
                            <i class="fa fa-pencil"></i>
                        </a>
                        <button class="btn btn-dark p-2" onclick="eliminarArtefacto(${item.id})">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar cenários:", error);
    }
}

// ==========================================
//  CRUD DE INVENTÁRIO TODOS
// ==========================================

async function carregarTodos() {
    try {
        // 1. Ir buscar TODOS os artefactos
        const respItens = await fetchComToken(`${API_INVENTARIO}/itens`);
        let lista = await respItens.json();

        // 2. Ir buscar as listas de pessoas para traduzir os IDs em Nomes
        const respAlunos = await fetchComToken(`${API_URL}/alunos`);
        const alunos = respAlunos.ok ? await respAlunos.json() : [];

        const respDocentes = await fetchComToken(`${API_URL}/docentes`);
        const docentes = respDocentes.ok ? await respDocentes.json() : [];

        const respDirecao = await fetchComToken(`${API_URL}/direcao`); 
        const diretores = respDirecao.ok ? await respDirecao.json() : [];

        // 3. SEM FILTRO! Queremos mostrar tudo misturado.

        // Ordenação do menor para o maior ID
        lista.sort((a, b) => a.id - b.id);

        // ATENÇÃO: O ID que puseste nesta tabela foi "tabela-artefactos"
        const tbody = document.querySelector("#tabela-artefactos tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="12" class="text-center text-muted">Nenhum artigo encontrado no inventário da escola.</td></tr>`;
            return;
        }

        lista.forEach((item) => {
            // A MAGIA DA IMAGEM
            const imgTag = item.imagem 
                ? `<img src="${item.imagem}" alt="Foto" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` 
                : `<span class="text-muted">Sem Foto</span>`;

            // --- TRADUÇÃO DOS IDs PARA NOMES ---
            let nomeDonoAluno = "-";
            if (item.encarregado) {
                nomeDonoAluno = `${item.encarregado.nomeAluno} ${item.encarregado.apelidoAluno || ''}`.trim();
            } else if (item.idEncEducacao) {
                const alunoEncontrado = alunos.find(a => a.idEncEducacao === item.idEncEducacao);
                nomeDonoAluno = alunoEncontrado ? `${alunoEncontrado.nomeAluno} ${alunoEncontrado.apelidoAluno || ''}`.trim() : `ID: ${item.idEncEducacao}`;
            }

            let nomeDonoDocente = "-";
            if (item.docente) {
                nomeDonoDocente = `${item.docente.nome} ${item.docente.apelido || ''}`.trim();
            } else if (item.idDocente) {
                const docenteEncontrado = docentes.find(d => d.idDocente === item.idDocente);
                nomeDonoDocente = docenteEncontrado ? `${docenteEncontrado.nome} ${docenteEncontrado.apelido || ''}`.trim() : `ID: ${item.idDocente}`;
            }

            let nomeDonoGestor = "-";
            if (item.direcao) {
                nomeDonoGestor = `${item.direcao.nomegestor || item.direcao.nomeGestor || ''}`.trim();
            } else if (item.idDirecao) {
                const gestorEncontrado = diretores.find(g => g.idDirecao === item.idDirecao || g.id_direcao === item.idDirecao); 
                nomeDonoGestor = gestorEncontrado ? `${gestorEncontrado.nomegestor || gestorEncontrado.nomeGestor || ''}`.trim() : `ID: ${item.idDirecao}`;
            }

            const corDisponibilidade = item.disponibilidade === 'Disponível' ? 'text-success' : 'text-danger';

            // ATENÇÃO: Retirei a última coluna (<td>) que tinha os botões de editar e apagar
            tbody.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td><strong>${item.descricao}</strong></td>
                    <td>${item.estado}</td>
                    <td>${item.tamanho}</td> 
                    <td>${item.precoAluguer} €</td>
                    <td class="fw-bold ${corDisponibilidade}">${item.disponibilidade}</td>
                    <td>${imgTag}</td>
                    <td>${item.categoria}</td>
                    <td>${item.telefone}</td>
                    <td>${nomeDonoAluno}</td>
                    <td>${nomeDonoDocente}</td>
                    <td>${nomeDonoGestor}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar todos os itens:", error);
    }
}

// --- 6. ELIMINAR ARTEFACTO ---
async function eliminarArtefacto(id) {
    if (!confirm("Tem a certeza que deseja eliminar esta peça do inventário? Esta ação não pode ser desfeita!")) return;
    
    try {
        const response = await fetchComToken(`${API_INVENTARIO}/itens/${id}`, { 
            method: 'DELETE' 
        });
        
        if (response.ok) {
            alert("Peça eliminada com sucesso!");
            
            // O JavaScript descobre em que página estás e atualiza a tabela correta automaticamente!
            if (document.querySelector("#tabela-figurinos")) {
                carregarFigurinos();
            } else if (document.querySelector("#tabela-acessorios")) {
                carregarAcessorios(); // Descomenta quando tiveres esta função
            } else if (document.querySelector("#tabela-cenarios")) {
                carregarCenarios(); // Descomenta quando tiveres esta função
            } else if (document.querySelector("#tabela-todos")) {
                carregarTodos(); // Descomenta quando tiveres esta função
            } else {
                location.reload(); // Redundância de segurança
            }
        } else {
            alert("Erro ao eliminar a peça: " + await response.text());
        }
    } catch (error) {
        console.error("Erro no fetch eliminar artefacto:", error);
    }
}
//#endregion
//#region PAGAMENTOS
// ==========================================
//   CRUD DE PAGAMENTOS
// ==========================================

window.pagamentosLista = [];

async function iniciarPagamentos() {
    try {
        const res = await fetchComToken(API_PAGAMENTOS);
        if (!res.ok) throw new Error();
        window.pagamentosLista = await res.json();
        window.pagamentosLista.sort((a, b) => b.id - a.id);

        // Inicializar mês atual
        const hoje = new Date();
        document.getElementById("filtro-mes").value =
            `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}`;

        atualizarStats();
        aplicarFiltros();
    } catch (e) {
        const tbody = document.getElementById("tabela-pagamentos-body");
        if (tbody) tbody.innerHTML =
            `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar pagamentos.</td></tr>`;
    }
}

function atualizarStats() {
    const mes = document.getElementById("filtro-mes").value;
    const doMes = mes
        ? window.pagamentosLista.filter(p => p.data && p.data.startsWith(mes))
        : window.pagamentosLista;
    const soma = t => doMes.filter(p => p.tipoPagamento === t).reduce((s, p) => s + (p.valor||0), 0);
    const m = soma(1), a = soma(2), c = soma(3);
    document.getElementById("stat-total").textContent = `${m+a+c}€`;
    document.getElementById("stat-men").textContent   = `${m}€`;
    document.getElementById("stat-art").textContent   = `${a}€`;
    document.getElementById("stat-coa").textContent   = `${c}€`;
    document.getElementById("stat-men-sub").textContent =
        `${doMes.filter(p=>p.tipoPagamento===1).length} registos`;
}

function aplicarFiltros() {
    atualizarStats();
    const tipo  = document.getElementById("filtro-tipo").value;
    const mes   = document.getElementById("filtro-mes").value;
    const busca = document.getElementById("filtro-busca").value.toLowerCase().trim();
    let lista = [...window.pagamentosLista];
    if (tipo)  lista = lista.filter(p => String(p.tipoPagamento) === tipo);
    if (mes)   lista = lista.filter(p => p.data && p.data.startsWith(mes));
    if (busca) lista = lista.filter(p => String(p.idEncEducacao||"").includes(busca));
    renderTabela(lista);
}

function renderTabela(lista) {
    const tbody = document.getElementById("tabela-pagamentos-body");
    if (!tbody) return;
    document.getElementById("tabela-count").textContent =
        `${lista.length} registo${lista.length!==1?"s":""}`;

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhum pagamento encontrado.</td></tr>`;
        return;
    }

    const TIPO_NOMES = { 1: "Mensalidade", 2: "Artefacto", 3: "Coaching" };
    const badgeCor   = { 1: "badge-outline-primary", 2: "badge-outline-warning", 3: "badge-outline-success" };

    tbody.innerHTML = "";
    lista.forEach(p => {
        const tipo    = TIPO_NOMES[p.tipoPagamento] || "Outro";
        const cor     = badgeCor[p.tipoPagamento] || "badge-secondary";
        const dataFmt = p.data ? p.data.split("-").reverse().join("/") : "—";
        tbody.innerHTML += `
            <tr>
                <td><b>#${p.id}</b></td>
                <td><span class="badge ${cor}">${tipo}</span></td>
                <td>${p.idEncEducacao || "—"}</td>
                <td><b>${p.valor != null ? p.valor+"€" : "—"}</b></td>
                <td>${dataFmt}</td>
                <td>
                    <a href="../forms/form_pagamentos.html?id=${p.id}" class="btn btn-dark p-2"><i class="fa fa-pencil"></i></a>
                    <button class="btn btn-dark p-2" onclick="eliminarPagamento(${p.id})"><i class="fa fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

async function eliminarPagamento(id) {
    if (!confirm("Tem a certeza que deseja eliminar este pagamento?")) return;
    try {
        const res = await fetchComToken(`${API_PAGAMENTOS}/eliminar/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        alert("Pagamento eliminado!");
        iniciarPagamentos();
    } catch { alert("Erro ao eliminar."); }
}

function exportarCSV() {
    const rows = document.querySelectorAll("#tabela-pagamentos tbody tr");
    let csv = "ID;Tipo;Encarregado;Valor;Data\n";
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 5) return;
        csv += [0,1,2,3,4].map(i => `"${cells[i].textContent.trim()}"`).join(";") + "\n";
    });
    const blob = new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `faturacao_${document.getElementById("filtro-mes").value||"todos"}.csv`;
    a.click();
}

async function carregarEncarregadosSelect() {
    const select = document.getElementById("id_enceducacao");
    if (!select) return;
    try {
        const response = await fetchComToken(`${API_URL}/alunos`);
        const lista = await response.json();
        select.innerHTML = '<option value="">Selecione um Encarregado</option>';
        lista.forEach(enc => {
            const option = document.createElement("option");
            option.value = enc.idEncEducacao;
            option.textContent = `${enc.nomeEncEducacao || ""} ${enc.apelidoEncEducacao || ""} (Aluno: ${enc.nomeAluno || "N/A"}) - ID: ${enc.idEncEducacao}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar encarregados:", error);
    }
}

async function editarPagamento(id) {
    const titulo = document.getElementById("form-titulo");
    if (titulo) titulo.innerHTML = "<b>Editar Pagamento</b>";
    try {
        await carregarEncarregadosSelect();
        const response = await fetchComToken(`${API_PAGAMENTOS}/${id}`);
        const p = await response.json();
        document.getElementById("id_pagamento").value    = p.id;
        document.getElementById("tipo_pagamento").value  = p.tipoPagamento;
        document.getElementById("valor").value           = p.valor || "";
        document.getElementById("data_pagamento").value  = p.data || "";
        document.getElementById("id_enceducacao").value  = p.idEncEducacao || "";
    } catch (error) { alert("Erro ao carregar dados do pagamento."); }
}

async function guardarPagamento(event) {
    if (event) event.preventDefault();
    const idVal = document.getElementById("id_pagamento").value;
    const payload = {
        id:            idVal ? parseInt(idVal) : null,
        tipoPagamento: parseInt(document.getElementById("tipo_pagamento").value),
        idEncEducacao: parseInt(document.getElementById("id_enceducacao").value) || null,
        valor:         parseFloat(document.getElementById("valor").value) || 0,
        data:          document.getElementById("data_pagamento").value || null,
        idAluguer:     null
    };
    try {
        const response = await fetchComToken(`${API_PAGAMENTOS}/guardar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            alert("Pagamento guardado!");
            window.location.href = "../faturacao/faturacao_validacaofaturacao.html";
        } else { alert("Erro ao guardar."); }
    } catch (error) { alert("Erro de ligação."); }
}

//#endregion