window.onload = function() {
  document.getElementById("distanciaCabo").focus();
}

function contabilizarAlcas(valorTotal) {
  let contador = 0;
  let numeroAtual = 1;

  while (numeroAtual <= valorTotal) {
    contador++;

    if (numeroAtual <= valorTotal) {
      numeroAtual += 3;
    } 
    
    if (numeroAtual-valorTotal == 2 || numeroAtual-valorTotal == 1) {
      contador++;
    }
  }

  let quantidadeAlcas = contador * 2;

  return quantidadeAlcas;
}

function contabilizarConjuntoBap(igualPostes) {
  let abracadeiraBap = igualPostes;
  let parafusoJ =  igualPostes

  return [abracadeiraBap, parafusoJ];
}

function contabilizarPostes(metrosCabo, lancePoste) {
  let postes = Math.floor(metrosCabo / lancePoste);

  return postes;
}

function contabilizarSupa(quantPostes, quantAlcas) {
  let supa = quantPostes + (quantAlcas / 2);

  return supa;
}

function metragemCordoalhaFibra(travessiaCabo, mediaLanceTravessia) {
  let metragem = travessiaCabo * mediaLanceTravessia;

  return metragem;
}

function metragemCordoalhaCaixa(quantidadeCaixa, mediaLanceCaixa) {
  let metragem = quantidadeCaixa * mediaLanceCaixa;

  return metragem;
}

function ancoragemCaixaReserva(quantidadeCaixa, quantidadeOptloop) {
  let quantidadeIsoladorCaixa = quantidadeCaixa * 2;
  let quantidaeIsoladorOptloop = quantidadeOptloop * 2;

  let quantidadeIsoladorTotal = quantidadeIsoladorCaixa + quantidaeIsoladorOptloop;

  return quantidadeIsoladorTotal;
}

function validarNumero(event) {
  let input = event.target;
  let valor = input.value;

  // Remover caracteres não numéricos usando uma expressão regular
  var numeroLimpo = valor.replace(/\D/g, "");

  // Atualizar o valor do campo com o número limpo
  input.value = numeroLimpo;
}

function liberacao() {
  const radioOpcao = document.getElementsByName("opcao");
  const camposAdicionais1 = document.getElementById("camposAdicionais1");
  const camposAdicionais2 = document.getElementById("camposAdicionais2");

  for (var i=0; i< radioOpcao.length; i++) {
    radioOpcao[i].addEventListener("change", function() {
      if (this.checked) {
        if (this.value === "sim") {
          camposAdicionais1.style.display = "block";
          camposAdicionais2.style.display = "block";
          document.getElementById("quantTravessia").setAttribute("required", "");
          document.getElementById("lanceTravessia").setAttribute("required", "");

        } else {
          camposAdicionais1.style.display = "none";
          camposAdicionais2.style.display = "none";
          document.getElementById("quantTravessia").removeAttribute("required");
          document.getElementById("lanceTravessia").removeAttribute("required");
        }
      }
    });
  }
}

const formulario = document.getElementById('myForm');
const lista = document.getElementById("lista");
var dados;

formulario.addEventListener('submit', (event) => {
  event.preventDefault();

  const qtdPostes = contabilizarPostes(document.getElementById("distanciaCabo").value, 
    document.getElementById("lancePoste").value
  );
  const qtdAlcas = contabilizarAlcas(qtdPostes);
  const conjuntoBapParafusoJ = contabilizarConjuntoBap(qtdPostes);
  const qtdConjuntoIsolador = ancoragemCaixaReserva(document.getElementById("quantCaixa").value,
    document.getElementById("quantReserva").value
  );
  const qtdSupa = contabilizarSupa(qtdPostes, qtdAlcas) - qtdConjuntoIsolador;
  const kitOptloop = parseInt(document.getElementById("quantCaixa").value) 
    + parseInt(document.getElementById("quantReserva").value
  );
  const cordoalhaCEO = metragemCordoalhaCaixa(document.getElementById("quantCaixa").value, 
    document.getElementById("lancePoste").value
  );
  const cordoalhaCabo = metragemCordoalhaFibra(document.getElementById("quantTravessia").value,
    document.getElementById("lanceTravessia").value
  );

  // Objeto FormData para enviar os dados
  const formData = new FormData();
  formData.append('Postes', qtdPostes);
  formData.append('Alça Pré-formada', qtdAlcas);
  formData.append('BAP', conjuntoBapParafusoJ[0]);
  formData.append('Parafuso J', conjuntoBapParafusoJ[1]);
  formData.append('Isolador Porcelana', qtdConjuntoIsolador);
  formData.append('Suporte Bap', qtdConjuntoIsolador);
  formData.append('Suporte Sir', qtdConjuntoIsolador);
  formData.append('Supa 3 em 1', qtdSupa);
  formData.append('Kit Optloop', kitOptloop);
  formData.append('Cordoalha para CEO', cordoalhaCEO + ' metros');
  formData.append('Cordoalha para Fibra', cordoalhaCabo + ' metros');

  limparLista();

  for (let [key, value] of formData.entries()) {
    const tr = document.createElement('tr');

    const chaveCel = document.createElement('td');
    chaveCel.innerText = key;
    tr.appendChild(chaveCel);

    const valorCel = document.createElement('td');
    valorCel.innerText = value;
    valorCel.style.textAlign = "center";
    tr.appendChild(valorCel);

    lista.appendChild(tr);
  }

  document.getElementById("liberarLista").style.display = "block";
  document.getElementById("myForm").reset();

  if (document.getElementById('liberarLista').style.display === 'block') {
    document.getElementById("camposAdicionais1").style.display = 'none';
    document.getElementById("camposAdicionais2").style.display = 'none';
    document.getElementById("quantTravessia").removeAttribute("required");
    document.getElementById("lanceTravessia").removeAttribute("required");
  }

  dados = {
    poste: qtdPostes,
    alca: qtdAlcas,
    bap: conjuntoBapParafusoJ[0],
    parafuso: conjuntoBapParafusoJ[1],
    isolador: qtdConjuntoIsolador,
    suporteBap: qtdConjuntoIsolador,
    suporteSir: qtdConjuntoIsolador,
    supa: qtdSupa,
    optloop: kitOptloop,
    cordoalhaCEO: cordoalhaCEO,
    cordoalhaCabo: cordoalhaCabo
  }

  console.log(dados)

});

function enviarDados() {
  const btn = document.getElementById('download');
  const queryString = new URLSearchParams(dados).toString();
  const url = `/gerar?${queryString}`;

  btn.value = 'Aguarde...';

  fetch(url, {
      method: 'GET',
    })
      .then((response) => {
      if (response.ok) {
        // Se a resposta estiver OK, faz o download do arquivo
        return response.blob();
      } else {
        // Se a resposta estiver com erro, lança um erro
        throw new Error('Erro ao enviar os dados');
      }
    })
    .then((blob) => {
      // Cria um objeto URL para o blob
      const url = URL.createObjectURL(blob);

      // Cria um link para o download do arquivo
      const link = document.createElement('a');
      link.href = url;
      link.download = 'documento.docx';
      link.click();

      setTimeout(() => {
        btn.value = 'Concluído!';

        setTimeout(() => {
          btn.value = 'Gerar Documento';
        }, 2000);
      });

      // Limpa o objeto URL
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error('Erro ao enviar os dados:', error);
    });
}

document.getElementById('download').addEventListener('click', enviarDados);

function limparLista() {
  lista.innerHTML = '';
}

