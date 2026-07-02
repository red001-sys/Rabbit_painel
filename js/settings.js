// settings.js

const Settings = {
  async load() {
    try {
      const { data } = await Api.get("/settings");
      document.getElementById("setting-valor").value = data.valor_por_instalacao;
      document.getElementById("setting-tempo").value = data.tempo_minimo_dias;
      document.getElementById("setting-minimo").value = data.pagamento_minimo;
    } catch (err) {
      showToast(err.message, "error");
    }
  },
};

document.getElementById("settings-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    valor_por_instalacao: Number(document.getElementById("setting-valor").value),
    tempo_minimo_dias: Number(document.getElementById("setting-tempo").value),
    pagamento_minimo: Number(document.getElementById("setting-minimo").value),
  };
  try {
    await Api.put("/settings", payload);
    showToast("Configurações salvas.", "success");
    Dashboard.load();
  } catch (err) {
    showToast(err.message, "error");
  }
});

document.getElementById("export-csv-affiliates").addEventListener("click", () =>
  Api.downloadFile("/export/csv?type=affiliates", "afiliados.csv").catch((e) => showToast(e.message, "error")));

document.getElementById("export-csv-installs").addEventListener("click", () =>
  Api.downloadFile("/export/csv?type=installs", "instalacoes.csv").catch((e) => showToast(e.message, "error")));

document.getElementById("export-json").addEventListener("click", async () => {
  try {
    const data = await Api.get("/export/json");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rabbit-buddy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    showToast(err.message, "error");
  }
});
