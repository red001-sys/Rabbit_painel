// finance.js

const Finance = {
  async load() {
    const loading = document.getElementById("finance-loading");
    const list = document.getElementById("finance-list");
    loading.hidden = false;
    list.innerHTML = "";
    try {
      const { data } = await Api.get("/finance");
      for (const f of data) {
        list.appendChild(this.item(f));
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      loading.hidden = true;
    }
  },

  item(f) {
    const status = f.pendente <= 0
      ? el("span", { class: "badge badge-active" }, "Em dia")
      : el("span", { class: `badge ${f.elegivel ? "badge-pending" : "badge-inactive"}` }, f.elegivel ? "Pendente" : "Abaixo do mínimo");

    const payBtn = el("button", {
      class: "btn btn-primary",
      onclick: () => PayModal.open(f),
    }, "Pagar");
    payBtn.disabled = f.pendente <= 0;
    if (f.pendente <= 0) payBtn.style.opacity = "0.4";

    return el("div", { class: "finance-item" }, [
      el("div", {}, [
        el("div", { class: "finance-name" }, `${f.name} · ${f.installs} instalações`),
        el("div", { class: "finance-meta" }, f.pix ? `PIX: ${f.pix}` : "PIX não cadastrado"),
      ]),
      el("div", { class: "finance-amounts" }, [
        el("div", { class: "finance-amount" }, [el("div", { class: "label" }, "Bruto"), el("div", { class: "value" }, formatMoney(f.bruto))]),
        el("div", { class: "finance-amount" }, [el("div", { class: "label" }, "Pago"), el("div", { class: "value value-good" }, formatMoney(f.pago))]),
        el("div", { class: "finance-amount" }, [el("div", { class: "label" }, "Pendente"), el("div", { class: "value value-warn" }, formatMoney(f.pendente))]),
        status,
        payBtn,
      ]),
    ]);
  },
};

const PayModal = {
  open(f) {
    document.getElementById("pay-code").value = f.code;
    document.getElementById("pay-affiliate-name").textContent = `${f.name} — pendente: ${formatMoney(f.pendente)}`;
    document.getElementById("pay-amount").value = f.pendente.toFixed(2);
    document.getElementById("pay-note").value = "";
    document.getElementById("pay-modal").hidden = false;
  },
  close() {
    document.getElementById("pay-modal").hidden = true;
  },
};

document.getElementById("pay-modal-cancel").addEventListener("click", () => PayModal.close());
document.getElementById("pay-modal").addEventListener("click", (e) => {
  if (e.target.id === "pay-modal") PayModal.close();
});

document.getElementById("pay-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    affiliate_code: document.getElementById("pay-code").value,
    amount: Number(document.getElementById("pay-amount").value),
    note: document.getElementById("pay-note").value.trim() || undefined,
  };
  try {
    await Api.post("/finance/pay", payload);
    showToast("Pagamento registrado.", "success");
    PayModal.close();
    Finance.load();
    Dashboard.load();
  } catch (err) {
    showToast(err.message, "error");
  }
});
