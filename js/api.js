// api.js — cliente HTTP para a Edge Function

// Troque pela URL real da sua function (sem o ?password= no final).
const API_BASE = "https://nbexlqtvllkhsxwmuhtq.supabase.co/functions/v1/affiliate-panel";

const Api = {
  async request(path, { method = "GET", body } = {}) {
    const headers = { "Content-Type": "application/json" };
    const token = Auth.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      Auth.logout();
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const msg = (isJson && data.error) || "Erro na requisição.";
      throw new Error(msg);
    }
    return data;
  },

  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: "POST", body }); },
  put(path, body) { return this.request(path, { method: "PUT", body }); },
  del(path) { return this.request(path, { method: "DELETE" }); },

  async downloadFile(path, filename) {
    const token = Auth.getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Falha ao exportar.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
