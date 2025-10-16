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

// Formata valor enquanto digita

amountInput.addEventListener("input", () => {
  const raw = amountInput.value.replace(/\D/g, "");

  if (!raw) {
    amountInput.value = "";
    return;
  }

  let value = (parseInt(raw, 10) / 100).toFixed(2);
  value = value.replace(".", ",");
  value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  amountInput.value = value;
});

// Formata número como R$ com ponto e vírgula

function formatarValor(valor) {
  return valor
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

  //Renderização e totais

function calcularTotais(lista) {
  let entradas = 0;
  let saidas = 0;
  let saldo = 0;

  for (const t of lista) {
    const v = parseFloat(t.amount);
    if (v >= 0) entradas += v;
    else saidas += Math.abs(v);
    saldo += v;
  }

  return { entradas, saidas, saldo };
}

// Renderiza a lista e saldo total

function renderTransactions() {
  transactionsContainer.innerHTML = "";
  const mesSelecionado = filtroMes?.value;

  const transacoesFiltradas = transactions.filter((t) => {
    if (!mesSelecionado) return true;
    const mes = new Date(t.data).toLocaleDateString("pt-BR").split("/")[1];
    return mes === mesSelecionado;
  });

  // Estado vazio

  if (transacoesFiltradas.length === 0) {
    transactionsContainer.innerHTML = `
      <div class="empty">
        <i class="fa-regular fa-folder-open"></i> Sem transações para esse período.
      </div>
    `;
  }

  // Cards das transações
  
  transacoesFiltradas.forEach((transaction, index) => {
    const card = document.createElement("div");

    const valor = parseFloat(transaction.amount);
    const isPos = valor >= 0;
    const sinal = isPos ? "+" : "-";

    card.className = `tx ${isPos ? "pos" : "neg"}`;
    card.innerHTML = `
      <div class="tx-row">
        <div>
          <div class="tx-name">${transaction.name}</div>
          <div class="tx-meta">
            <span class="badge ${isPos ? "pos" : "neg"}">${isPos ? "Entrou" : "Saiu"}</span>
            • ${new Date(transaction.data).toLocaleDateString("pt-BR")}
          </div>
        </div>
        <div class="text-end">
          <div style="font-weight:700">${sinal} R$ ${formatarValor(Math.abs(valor))}</div>
          <div class="tx-actions mt-2">
            <button class="btn btn-sm btn-outline-primary me-1" onclick="editTransaction(${index})" aria-label="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="removeTransaction(${index})" aria-label="Excluir">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    transactionsContainer.appendChild(card);
  });

  // Totais

  const { entradas, saidas, saldo } = calcularTotais(transacoesFiltradas);

  if (resEntradas) resEntradas.textContent = `R$ ${formatarValor(entradas)}`;
  if (resSaidas) resSaidas.textContent = `R$ ${formatarValor(saidas)}`;
  if (resSaldo) resSaldo.textContent = `R$ ${formatarValor(saldo)}`;

  // Saldo principal

  saldoTotal.textContent = `Saldo: R$ ${formatarValor(saldo)}`;
  saldoTotal.classList.toggle("pos", saldo >= 0);
  saldoTotal.classList.toggle("neg", saldo < 0);
}

// Adiciona ou edita transação

function addTransaction(event, isPositive) {
  event.preventDefault();

  const name = nameInput.value.trim();
  let valorFormatado = amountInput.value;

  if (!name || !valorFormatado) {
    alert("Preencha o nome e o valor corretamente.");
    return;
  }

  const numericValue = parseFloat(
    valorFormatado.replace(/\./g, "").replace(",", ".")
  );
  if (isNaN(numericValue)) {
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

// Remove transação

function removeTransaction(index) {
  transactions.splice(index, 1);
  renderTransactions();
}

// Editar transação

function editTransaction(index) {
  const transacao = transactions[index];
  nameInput.value = transacao.name;

  const valorFormatado = formatarValor(Math.abs(transacao.amount));
  amountInput.value = valorFormatado;

  editIndex = index;
}


  // Filtro por mês

function filtrarPorMes() {
  renderTransactions();
}

  // Expor para HTML

window.addTransaction = addTransaction;
window.removeTransaction = removeTransaction;
window.editTransaction = editTransaction;
window.filtrarPorMes = filtrarPorMes;

  // Inicialização

renderTransactions();
