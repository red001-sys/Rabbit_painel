// main.js — inicializacao geral e navegacao entre abas

const App = {
  loaded: { dashboard: false, affiliates: false, installs: false, finance: false, settings: false },

  init() {
    this.switchTab("dashboard");
  },

  switchTab(tab) {
    document.querySelectorAll(".nav-item[data-tab]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === tab);
    });

    // carrega dados sob demanda, so na primeira vez que a aba e aberta
    if (!this.loaded[tab]) {
      this.loaded[tab] = true;
      if (tab === "dashboard") Dashboard.load();
      if (tab === "affiliates") Affiliates.load();
      if (tab === "installs") Installs.load();
      if (tab === "finance") Finance.load();
      if (tab === "settings") Settings.load();
    }
  },
};

document.querySelectorAll(".nav-item[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => App.switchTab(btn.dataset.tab));
});

// se ja existe um token valido na sessao, pula direto pro app
window.addEventListener("DOMContentLoaded", () => {
  if (Auth.isLoggedIn()) {
    document.getElementById("view-login").hidden = true;
    document.getElementById("view-app").hidden = false;
    App.init();
  }
});
