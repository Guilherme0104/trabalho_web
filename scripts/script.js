document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch('scripts/dados/detalhamentopessoal.json');
    if (!response.ok) throw new Error("Arquivo não encontrado!");
    const dados = await response.json();
    listarFuncionarios(dados.data);
    
    // Adiciona o evento click ao botão btCargo
    const btCargo = document.getElementById('btCargo');
    btCargo.addEventListener('click', () => {
      const lista = document.getElementById('lista');
      lista.textContent = '';
      const agrupados = agrupaCargo(dados.data);
      listarAgrupadosPorCargo(agrupados);
    });



  } catch (error) {
    console.error("Erro:", error);
  }
});

function listarFuncionarios(funcionarios) {
  const lista = document.getElementById('lista');
  let html = '';
  funcionarios.map((funcionario) => {
    html += `<div class="info">
        <span class="border">${funcionario['Nome do funcionário']}</span>
        <span class="border">${formatarCargo(funcionario.Cargo)}</span>
        <span class="border">${formatarSetor(funcionario.Setor)}</span>
        <span class="border">${formatarValor(consertaValor(funcionario.Proventos))}</span>
        <span class="border">${formatarValor(consertaValor(funcionario.Descontos))}</span>
        <span>${formatarValor((funcionario.Líquido))}</span>
      </div> `;
  });
  lista.innerHTML = html;
}

function listarAgrupadosPorCargo(agrupados) {
  const lista = document.getElementById('lista');
  let html = '';
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
  return cargo.replace(/^\d+\s*-\s*/, '').trim();
}

function validaFolha(folha) {
  if (folha === "FOLHA NORMAL") {
    return 'normal';
  } else return 'unormal';
}

function formatarSetor(setor) {
  return setor.split(' - ')[0].trim();
}

function formatarValor(valor) {
  
  return valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function consertaValor(valor) {
  var text = valor.toString();
  text = text.replace('.', '')

  var num = Number.parseFloat(text).toFixed(2) / 100;


  return num;
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
        quantidade: 0
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
    funcionarios: valores.quantidade
  }));
}