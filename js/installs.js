// installs.js

const Installs = {
  page: 1,
  perPage: 50,
  total: 0,

  async load() {
    const loading = document.getElementById("installs-loading");
    const empty = document.getElementById("installs-empty");
    const tbody = document.getElementById("installs-tbody");
    loading.hidden = false;
    empty.hidden = true;
    tbody.innerHTML = "";

    const q = document.getElementById("installs-search").value.trim();
    const from = document.getElementById("installs-from").value;
    const to = document.getElementById("installs-to").value;
    const onlySuspicious = document.getElementById("installs-only-suspicious").checked;

    const params = new URLSearchParams({ page: this.page, per_page: this.perPage });
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (onlySuspicious) params.set("suspicious", "true");

    try {
      const { data, count } = await Api.get(`/installs?${params.toString()}`);
      this.total = count ?? 0;
      empty.hidden = (data ?? []).length > 0;
      for (const i of data ?? []) {
        const statusBadge = i.is_suspicious
          ? el("span", { class: "badge badge-pending", title: i.suspicious_reason ?? "" }, "⚠ Suspeita")
          : el("span", { class: "badge badge-active" }, "OK");
        tbody.appendChild(el("tr", {}, [
          el("td", { class: "mono" }, i.affiliate_code ?? "-"),
          el("td", { class: "mono" }, i.device_id ?? "-"),
          el("td", {}, i.app_version ?? "-"),
          el("td", {}, i.city ?? "-"),
          el("td", { class: "mono" }, i.ip ?? "-"),
          el("td", { class: "mono" }, i.install_referrer ?? "-"),
          el("td", {}, statusBadge),
          el("td", {}, formatDate(i.created_at)),
        ]));
      }
      this.renderPagination();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      loading.hidden = true;
    }
  },

  renderPagination() {
    const wrap = document.getElementById("installs-pagination");
    wrap.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(this.total / this.perPage));
    wrap.appendChild(el("button", {
      class: "btn btn-ghost",
      onclick: () => { if (this.page > 1) { this.page--; this.load(); } },
    }, "← Anterior"));
    wrap.appendChild(el("span", { class: "muted" }, ` Página ${this.page} de ${totalPages} `));
    wrap.appendChild(el("button", {
      class: "btn btn-ghost",
      onclick: () => { if (this.page < totalPages) { this.page++; this.load(); } },
    }, "Próxima →"));
  },
};

document.getElementById("installs-search").addEventListener("input", debounce(() => { Installs.page = 1; Installs.load(); }, 300));
document.getElementById("installs-from").addEventListener("change", () => { Installs.page = 1; Installs.load(); });
document.getElementById("installs-to").addEventListener("change", () => { Installs.page = 1; Installs.load(); });
document.getElementById("installs-only-suspicious").addEventListener("change", () => { Installs.page = 1; Installs.load(); });
