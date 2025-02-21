/**
 * Pega os funcionarios do json e retorna um array de objetos com todos os funcionarios
 * @param {string} path - default pro caminho padrao caso nao tenha sido especificado
 **/
async function getFuncionarios(
  path = "/scripts/dados/detalhamentopessoal.json",
) {
  return await fetch(path)
    .then((blob) => blob.json())
    .then((json) => json.data)
    .catch((error) => {
      console.error(error);
    });
}

function formatarDados(dados) {
  for (let i = 0; i < dados.length; i++) {
    Object.keys(dados[i]).forEach((campo) => {
      if (campo === "Cargo") dados[i][campo] = formatarCargo(dados[i][campo]);
      if (campo === "Setor") dados[i][campo] = formatarSetor(dados[i][campo]);
      if (campo === "Proventos" || campo === "Descontos")
        dados[i][campo] = consertaValor(dados[i][campo]);
      if (campo === "Líquido") dados[i][campo] = formatarValor(dados[i][campo]);
    });
  }
}

/**
 * Pega um array de funcionarios e coloca todos no html
 *@param {Object[]} [funcionarios] - array de funcionarios para colocar na tela
 * @param {string[]} [tableHeaders] - array de campos para mostrar na tela (não obrigatório)
 **/
function updateTela(
  funcionarios,
  tableHeaders = [
    "Nome do funcionário",
    "Cargo",
    "Setor",
    "Proventos",
    "Descontos",
    "Líquido",
  ],
) {
  const table = document.createElement("table");
  table.setAttribute("id", "table");

  let headers = document.createElement("tr");
  tableHeaders.forEach((header) => {
    let h = document.createElement("th");
    h.textContent = header;
    headers.appendChild(h);
  });
  table.appendChild(headers);

  funcionarios.forEach((fun) => {
    let data;
    let row = document.createElement("tr");
    tableHeaders.forEach((campo) => {
      data = document.createElement("td");
      data.textContent = fun[campo];
      row.appendChild(data);
    });
    table.appendChild(row);
  });

  const lista = document.getElementById("lista");
  lista.appendChild(table);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Adiciona o evento click ao botão btCargo
    const btCargo = document.getElementById("btCargo");
    btCargo.addEventListener("click", () => {
      const lista = document.getElementById("lista");
      lista.textContent = "";
      const agrupados = agrupaCargo(dados.data);
      listarAgrupadosPorCargo(agrupados);
    });

    let a = getFuncionarios();
    a.then((a) => formatarDados(a));
    a.then((a) => updateTela(a));
  } catch (error) {
    console.error("Erro:", error);
  }
});

function listarFuncionarios(funcionarios) {
  const lista = document.getElementById("lista");
  let html = "";
  funcionarios.map((funcionario) => {
    html += `<div class="info">
        <span class="border">${funcionario["Nome do funcionário"]}</span>
        <span class="border">${formatarCargo(funcionario.Cargo)}</span>
        <span class="border">${formatarSetor(funcionario.Setor)}</span>
        <span class="border">${formatarValor(consertaValor(funcionario.Proventos))}</span>
        <span class="border">${formatarValor(consertaValor(funcionario.Descontos))}</span>
        <span>${formatarValor(funcionario.Líquido)}</span>
      </div> `;
  });
  lista.innerHTML = html;
}

function listarAgrupadosPorCargo(agrupados) {
  const lista = document.getElementById("lista");
  let html = "";
  agrupados.map((grupo) => {
    html += `<div class="info">
        <span class="border">${grupo.cargo}</span>
        <span class="border">${formatarValor(grupo.mediaProventos)}</span>
        <span class="border">${formatarValor(grupo.mediaDescontos)}</span>
        <span class="border">${formatarValor(grupo.mediaLiquido)}</span>
        <span>${grupo.funcionarios}</span>
      </div> `;
  });
  lista.innerHTML = html;
}

function formatarCargo(cargo) {
  return cargo.replace(/^\d+\s*-\s*/, "").trim();
}

function formatarSetor(setor) {
  return setor.split(" - ")[0].trim();
}

function formatarValor(valor) {
  return valor.toLocaleString("pt-br", { style: "currency", currency: "BRL" });
}

function consertaValor(valor) {
  var text = valor.toString();
  text = text.replace(".", "");

  var num = Number.parseFloat(text).toFixed(2) / 100;

  return formatarValor(num);
}

function agrupaCargo(funcionarios) {
  const cargos = funcionarios.reduce((acc, funcionario) => {
    const cargo = funcionario.Cargo;

    if (!cargo) return acc;

    if (!acc[cargo]) {
      acc[cargo] = {
        toralProventos: 0,
        totalDescontos: 0,
        totalLiquido: 0,
        quantidade: 0,
      };
    }
    acc[cargo].totalProventos += consertaValor(funcionario.Proventos);
    acc[cargo].totalDescontos += consertaValor(funcionario.Descontos);
    acc[cargo].totalLiquido += consertaValor(funcionario.Líquido);
    acc[cargo].quantidade += 1;

    return acc;
  }, {});

  return Object.entries(cargos).map(([cargo, valores]) => ({
    cargo: cargo,
    mediaProventos: valores.totalProventos / valores.quantidade,
    mediaDescontos: valores.totalDescontos / valores.quantidade,
    mediaLiquido: valores.totalLiquido / valores.quantidade,
    funcionarios: valores.quantidade,
  }));
}
