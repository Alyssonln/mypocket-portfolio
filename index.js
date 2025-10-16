const form = document.querySelector("form");
const nameInput = document.querySelector("#name");
const amountInput = document.querySelector("#amount");
const transactionsContainer = document.querySelector("#transactions");
const saldoTotal = document.querySelector("#saldo-total");
const filtroMes = document.querySelector("#filtroMes");
const resEntradas = document.querySelector("#res-entradas");
const resSaidas = document.querySelector("#res-saidas");
const resSaldo = document.querySelector("#res-saldo");

let transactions = [];
let editIndex = null;

amountInput.addEventListener("input", () => {
  const raw = amountInput.value.replace(/\D/g, "");
  if (!raw) {
    amountInput.value = "";
    return;
  }
  let value = (parseInt(raw, 10) / 100).toFixed(2);
  value = value.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  amountInput.value = value;
});

function formatarValor(valor) {
  return valor
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function calcularTotais(lista) {
  let entradas = 0, saidas = 0, saldo = 0;
  for (const t of lista) {
    const v = Number(t.amount);
    if (v >= 0) entradas += v; else saidas += Math.abs(v);
    saldo += v;
  }
  return { entradas, saidas, saldo };
}

function renderTransactions() {
  transactionsContainer.innerHTML = "";
  const mesSelecionado = filtroMes?.value || "";

  const withIndex = transactions.map((t, i) => ({ ...t, _i: i }));

  const transacoesFiltradas = withIndex.filter((t) => {
    if (!mesSelecionado) return true;
    const d = new Date(t.data);
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    return mes === mesSelecionado;
  });

  if (transacoesFiltradas.length === 0) {
    transactionsContainer.innerHTML = `
      <div class="empty">
        <i class="fa-regular fa-folder-open"></i> Sem transações para esse período.
      </div>`;
  }

  transacoesFiltradas.forEach((transaction) => {
    const card = document.createElement("div");
    const valor = Number(transaction.amount);
    const isPos = valor >= 0;
    const sinal = isPos ? "+" : "-";

    card.className = `tx ${isPos ? "pos" : "neg"}`;
    card.innerHTML = `
      <div class="tx-row">
        <div>
          <div class="tx-name">${transaction.name}</div>
          <div class="tx-meta">
            <span class="badge ${isPos ? "pos" : "neg"}">
              ${isPos ? "Entrou" : "Saiu"}
            </span>
            • ${new Date(transaction.data).toLocaleDateString("pt-BR")}
          </div>
        </div>
        <div class="text-end">
          <div style="font-weight:700">${sinal} R$ ${formatarValor(Math.abs(valor))}</div>
          <div class="tx-actions mt-2">
            <button class="btn btn-sm btn-outline-primary me-1" onclick="editTransaction(${transaction._i})" aria-label="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="removeTransaction(${transaction._i})" aria-label="Excluir">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>`;
    transactionsContainer.appendChild(card);
  });

  const { entradas, saidas, saldo } = calcularTotais(transacoesFiltradas);
  if (resEntradas) resEntradas.textContent = `R$ ${formatarValor(entradas)}`;
  if (resSaidas) resSaidas.textContent = `R$ ${formatarValor(saidas)}`;
  if (resSaldo) resSaldo.textContent = `R$ ${formatarValor(saldo)}`;

  saldoTotal.textContent = `Saldo: R$ ${formatarValor(saldo)}`;
  saldoTotal.classList.toggle("pos", saldo >= 0);
  saldoTotal.classList.toggle("neg", saldo < 0);
}

function addTransaction(event, isPositive) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const valorFormatado = amountInput.value;

  if (!name || !valorFormatado) {
    alert("Preencha o nome e o valor corretamente.");
    return;
  }

  const numericValue = parseFloat(
    valorFormatado.replace(/\./g, "").replace(",", ".")
  );
  if (Number.isNaN(numericValue)) {
    alert("Digite um valor numérico válido.");
    return;
  }

  const amount = isPositive ? Math.abs(numericValue) : -Math.abs(numericValue);

  if (editIndex !== null) {
    transactions[editIndex] = { ...transactions[editIndex], name, amount };
    editIndex = null;
  } else {
    const data = new Date().toISOString();
    transactions.push({ name, amount, data });
  }

  renderTransactions();
  form.reset();
}

function removeTransaction(index) {
  transactions.splice(index, 1);
  renderTransactions();
}

function editTransaction(index) {
  const transacao = transactions[index];
  nameInput.value = transacao.name;
  amountInput.value = formatarValor(Math.abs(transacao.amount));
  editIndex = index;
}

function filtrarPorMes() {
  renderTransactions();
}

window.addTransaction = addTransaction;
window.removeTransaction = removeTransaction;
window.editTransaction = editTransaction;
window.filtrarPorMes = filtrarPorMes;

renderTransactions();
