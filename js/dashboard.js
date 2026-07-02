// dashboard.js

const Dashboard = {
  async load() {
    const container = document.getElementById("dashboard-cards");
    try {
      const data = await Api.get("/dashboard");
      container.innerHTML = "";
      container.appendChild(this.card("Total de afiliados", data.total_affiliates, "accent"));
      container.appendChild(this.card("Instalações", data.total_installs, "accent"));
      container.appendChild(this.card("Hoje", data.installs_today, "good"));
      container.appendChild(this.card("Pendente", formatMoney(data.pendente_total), "warn"));
    } catch (err) {
      showToast(err.message, "error");
    }
  },

  card(label, value, variant) {
    const cls = variant === "good" ? "card card-good" : variant === "warn" ? "card card-warn" : "card card-accent";
    return el("div", { class: cls }, [
      el("div", { class: "card-label" }, label),
      el("div", { class: "card-value" }, String(value)),
    ]);
  },
};
