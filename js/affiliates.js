// affiliates.js

const Affiliates = {
  cache: [],
  sortKey: null,
  sortDir: 1,

  async load() {
    const loading = document.getElementById("affiliates-loading");
    const empty = document.getElementById("affiliates-empty");
    const tbody = document.querySelector("#affiliates-table tbody");
    loading.hidden = false;
    empty.hidden = true;
    tbody.innerHTML = "";
    try {
      const q = document.getElementById("affiliates-search").value.trim();
      const { data } = await Api.get(`/affiliates${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      this.cache = data;
      this.render();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      loading.hidden = true;
    }
  },

  render() {
    const tbody = document.querySelector("#affiliates-table tbody");
    const empty = document.getElementById("affiliates-empty");
    let rows = [...this.cache];
    if (this.sortKey) {
      rows.sort((a, b) => {
        const av = a[this.sortKey], bv = b[this.sortKey];
        if (typeof av === "number") return (av - bv) * this.sortDir;
        return String(av ?? "").localeCompare(String(bv ?? "")) * this.sortDir;
      });
    }
    tbody.innerHTML = "";
    empty.hidden = rows.length > 0;

    for (const a of rows) {
      const tr = el("tr", {}, [
        el("td", { class: "mono" }, a.code),
        el("td", {}, a.name),
        el("td", {}, String(a.installs)),
        el("td", {}, el("span", { class: `badge ${a.status === "active" ? "badge-active" : "badge-inactive"}` }, a.status === "active" ? "Ativo" : "Inativo")),
        el("td", {}, `${Number(a.commission_pct).toFixed(1)}%`),
        el("td", {}, this.actions(a)),
      ]);
      tbody.appendChild(tr);
    }
  },

  actions(a) {
    const wrap = el("div", { class: "row-actions" });
    wrap.appendChild(el("button", {
      class: "btn-icon",
      title: "Copiar link",
      onclick: async () => {
        const ok = await copyToClipboard(a.link);
        showToast(ok ? "Link copiado!" : "Não foi possível copiar.", ok ? "success" : "error");
      },
    }, "📋"));
    wrap.appendChild(el("button", {
      class: "btn-icon",
      title: "Editar",
      onclick: () => AffiliateModal.open(a),
    }, "✏"));
    wrap.appendChild(el("button", {
      class: "btn-icon",
      title: "Excluir",
      onclick: () => this.remove(a),
    }, "🗑"));
    return wrap;
  },

  async remove(a) {
    if (!confirm(`Excluir o afiliado "${a.name}" (${a.code})? Essa ação não pode ser desfeita.`)) return;
    try {
      await Api.del(`/affiliates/${encodeURIComponent(a.code)}`);
      showToast("Afiliado excluído.", "success");
      this.load();
    } catch (err) {
      showToast(err.message, "error");
    }
  },
};

// ---- ordenação por coluna ----
document.querySelectorAll('#affiliates-table thead th[data-sort]').forEach((th) => {
  th.addEventListener("click", () => {
    const key = th.dataset.sort;
    Affiliates.sortDir = Affiliates.sortKey === key ? -Affiliates.sortDir : 1;
    Affiliates.sortKey = key;
    Affiliates.render();
  });
});

document.getElementById("affiliates-search").addEventListener("input", debounce(() => Affiliates.load(), 300));
document.getElementById("new-affiliate-btn").addEventListener("click", () => AffiliateModal.open(null));

// ---- modal novo/editar ----
const AffiliateModal = {
  open(affiliate) {
    const modal = document.getElementById("affiliate-modal");
    const title = document.getElementById("affiliate-modal-title");
    const codeInput = document.getElementById("af-code");
    const statusField = document.getElementById("af-status-field");

    document.getElementById("af-original-code").value = affiliate?.code ?? "";
    codeInput.value = affiliate?.code ?? "";
    codeInput.disabled = !!affiliate;
    document.getElementById("af-name").value = affiliate?.name ?? "";
    document.getElementById("af-pix").value = affiliate?.pix ?? "";
    document.getElementById("af-email").value = affiliate?.email ?? "";
    document.getElementById("af-commission").value = affiliate?.commission_pct ?? 10;
    document.getElementById("af-status").value = affiliate?.status ?? "active";
    statusField.hidden = !affiliate;
    title.textContent = affiliate ? "Editar afiliado" : "Novo afiliado";

    modal.hidden = false;
  },
  close() {
    document.getElementById("affiliate-modal").hidden = true;
  },
};

document.getElementById("affiliate-modal-cancel").addEventListener("click", () => AffiliateModal.close());
document.getElementById("affiliate-modal").addEventListener("click", (e) => {
  if (e.target.id === "affiliate-modal") AffiliateModal.close();
});

document.getElementById("affiliate-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const originalCode = document.getElementById("af-original-code").value;
  const payload = {
    code: document.getElementById("af-code").value.trim(),
    name: document.getElementById("af-name").value.trim(),
    pix: document.getElementById("af-pix").value.trim(),
    email: document.getElementById("af-email").value.trim(),
    commission_pct: Number(document.getElementById("af-commission").value),
  };

  try {
    if (originalCode) {
      payload.status = document.getElementById("af-status").value;
      delete payload.code;
      await Api.put(`/affiliates/${encodeURIComponent(originalCode)}`, payload);
      showToast("Afiliado atualizado.", "success");
    } else {
      await Api.post("/affiliates", payload);
      showToast("Afiliado criado.", "success");
    }
    AffiliateModal.close();
    Affiliates.load();
    Dashboard.load();
  } catch (err) {
    showToast(err.message, "error");
  }
});
