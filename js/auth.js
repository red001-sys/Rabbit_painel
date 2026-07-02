// auth.js — login e sessao (token guardado no sessionStorage)

const Auth = {
  TOKEN_KEY: "rb_affiliate_token",

  getToken() {
    return sessionStorage.getItem(this.TOKEN_KEY);
  },
  setToken(token) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  },
  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    document.getElementById("view-app").hidden = true;
    document.getElementById("view-login").hidden = false;
  },
  isLoggedIn() {
    return !!this.getToken();
  },
};

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("login-password").value;
  const btn = document.getElementById("login-btn");
  const errorEl = document.getElementById("login-error");
  errorEl.hidden = true;
  btn.disabled = true;
  btn.textContent = "Entrando...";

  try {
    const data = await Api.post("/login", { password });
    Auth.setToken(data.token);
    document.getElementById("view-login").hidden = true;
    document.getElementById("view-app").hidden = false;
    document.getElementById("login-password").value = "";
    App.init();
  } catch (err) {
    errorEl.textContent = err.message || "Não foi possível entrar.";
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = "Entrar";
  }
});

document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
