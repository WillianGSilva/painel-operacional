const state = {
    pagina: "transferencias"
};

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");
const btnAtualizar = document.getElementById("btnAtualizar");
const textoAtualizar = document.getElementById("textoAtualizar");
const mensagemErro = document.getElementById("mensagemErro");

navItems.forEach((button) => {
    button.addEventListener("click", () => {
        state.pagina = button.dataset.page;

        navItems.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        pages.forEach((page) => page.classList.remove("active"));
        document
            .getElementById(`page-${state.pagina}`)
            .classList.add("active");
    });
});

btnAtualizar.addEventListener("click", () => {
    if (state.pagina === "transferencias") {
        carregarTransferencias();
    }
});

function normalizarOrigem(origem) {
    if (!origem) return "—";
    return origem
        .replace("-SP(HUB)", "")
        .replace("-SC(HUB)", "")
        .replace("-PR(HUB)", "")
        .replace("-MG(HUB)", "")
        .replace("-RJ(HUB)", "")
        .replace("-ES(HUB)", "")
        .replace("(HUB)", "");
}

function formatarDataHora(valor) {
    if (!valor) return "—";

    const data = new Date(valor.replace(" ", "T"));

    if (Number.isNaN(data.getTime())) {
        return valor;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(data);
}

function formatarSomenteHora(valor) {
    if (!valor) return "—";

    const data = new Date(valor.replace(" ", "T"));

    if (Number.isNaN(data.getTime())) {
        return valor;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    }).format(data);
}

function formatarNumero(valor) {
    return new Intl.NumberFormat("pt-BR").format(Number(valor || 0));
}

function formatarAtraso(minutos) {
    const total = Number(minutos || 0);

    if (total <= 0) return "—";

    const horas = Math.floor(total / 60);
    const minutosRestantes = total % 60;

    if (horas === 0) {
        return `${minutosRestantes} min`;
    }

    if (minutosRestantes === 0) {
        return `${horas}h`;
    }

    return `${horas}h ${minutosRestantes}min`;
}

function statusInfo(status) {
    if (status === "ATRASADO") {
        return {
            classe: "atrasado",
            texto: "Atrasado",
            ponto: "●"
        };
    }

    if (status === "CHEGOU") {
        return {
            classe: "chegou",
            texto: "Chegou",
            ponto: "●"
        };
    }

    return {
        classe: "transito",
        texto: "Em trânsito",
        ponto: "●"
    };
}

function ordenarTransferencias(lista) {
    const prioridade = {
        ATRASADO: 1,
        "EM TRANSITO": 2,
        CHEGOU: 3
    };

    return [...lista].sort((a, b) => {
        const statusA = prioridade[a.status] || 99;
        const statusB = prioridade[b.status] || 99;

        if (statusA !== statusB) {
            return statusA - statusB;
        }

        if (a.status === "ATRASADO") {
            return Number(b.atraso_minutos || 0) - Number(a.atraso_minutos || 0);
        }

        return String(a.previsao_chegada || "").localeCompare(
            String(b.previsao_chegada || "")
        );
    });
}

function renderResumo(resumo) {
    document.getElementById("kpiTotal").textContent =
        formatarNumero(resumo.total);

    document.getElementById("kpiChegaram").textContent =
        formatarNumero(resumo.chegaram);

    document.getElementById("kpiTransito").textContent =
        formatarNumero(resumo.em_transito);

    document.getElementById("kpiAtrasados").textContent =
        formatarNumero(resumo.atrasados);

    document.getElementById("kpiNotas").textContent =
        formatarNumero(resumo.notas_pendentes);

    document.getElementById("kpiVolumes").textContent =
        formatarNumero(resumo.volumes_pendentes);
}

function renderTabela(transferencias) {
    const tbody = document.getElementById("tabelaTransferencias");

    if (!transferencias.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-state">
                    Nenhuma transferência prevista para hoje.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = transferencias.map((t) => {
        const status = statusInfo(t.status);

        return `
            <tr>
                <td>
                    <span class="status-badge ${status.classe}">
                        ${status.ponto} ${status.texto}
                    </span>
                </td>

                <td>
                    <span class="origin-route">
                        ${normalizarOrigem(t.origem)} → CPS
                    </span>
                </td>

                <td>${t.placa || "—"}</td>

                <td class="romaneio" title="${t.romaneio || ""}">
                    ${t.romaneio || "—"}
                </td>

                <td>${formatarDataHora(t.saida)}</td>

                <td><strong>${formatarSomenteHora(t.previsao_chegada)}</strong></td>

                <td>${formatarSomenteHora(t.chegada_real)}</td>

                <td>${formatarNumero(t.qtd_notas)}</td>

                <td>${formatarNumero(t.qtd_volumes)}</td>

                <td class="${t.status === "ATRASADO" ? "atraso" : ""}">
                    ${t.status === "ATRASADO"
                        ? formatarAtraso(t.atraso_minutos)
                        : "—"}
                </td>
            </tr>
        `;
    }).join("");
}

function renderMobileCards(transferencias) {
    const container = document.getElementById("mobileCards");

    if (!transferencias.length) {
        container.innerHTML = `
            <div class="empty-state">
                Nenhuma transferência prevista para hoje.
            </div>
        `;
        return;
    }

    container.innerHTML = transferencias.map((t) => {
        const status = statusInfo(t.status);

        return `
            <article class="vehicle-card">
                <div class="vehicle-card-header">
                    <div>
                        <div class="vehicle-card-title">
                            ${normalizarOrigem(t.origem)} → CPS
                        </div>
                        <small>${t.placa || "—"}</small>
                    </div>

                    <span class="status-badge ${status.classe}">
                        ${status.ponto} ${status.texto}
                    </span>
                </div>

                <div class="vehicle-grid">
                    <div class="vehicle-field">
                        <small>Previsão</small>
                        <strong>${formatarSomenteHora(t.previsao_chegada)}</strong>
                    </div>

                    <div class="vehicle-field">
                        <small>Chegada</small>
                        <strong>${formatarSomenteHora(t.chegada_real)}</strong>
                    </div>

                    <div class="vehicle-field">
                        <small>Notas</small>
                        <strong>${formatarNumero(t.qtd_notas)}</strong>
                    </div>

                    <div class="vehicle-field">
                        <small>Volumes</small>
                        <strong>${formatarNumero(t.qtd_volumes)}</strong>
                    </div>

                    <div class="vehicle-field">
                        <small>Atraso</small>
                        <strong class="${t.status === "ATRASADO" ? "atraso" : ""}">
                            ${t.status === "ATRASADO"
                                ? formatarAtraso(t.atraso_minutos)
                                : "—"}
                        </strong>
                    </div>

                    <div class="vehicle-field">
                        <small>Romaneio</small>
                        <strong>${t.romaneio || "—"}</strong>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

async function carregarTransferencias() {
    mensagemErro.classList.add("hidden");
    mensagemErro.textContent = "";

    btnAtualizar.disabled = true;
    textoAtualizar.textContent = "Atualizando...";

    try {
        const response = await fetch("/api/transferencias", {
            method: "GET",
            cache: "no-store"
        });

        const data = await response.json();

        if (!response.ok || data.erro) {
            throw new Error(data.mensagem || "Erro ao consultar as transferências.");
        }

        const transferencias = ordenarTransferencias(data.transferencias || []);

        renderResumo(data.resumo || {});
        renderTabela(transferencias);
        renderMobileCards(transferencias);

        document.getElementById("ultimaAtualizacao").textContent =
            data.atualizado_em || new Date().toLocaleString("pt-BR");

    } catch (error) {
        mensagemErro.textContent = error.message;
        mensagemErro.classList.remove("hidden");
    } finally {
        btnAtualizar.disabled = false;
        textoAtualizar.textContent = "Atualizar dados";
    }
}
