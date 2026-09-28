// Guardar e recuperar, com número de versão.
//
// O número de versão parece exagero para um brinquedo e não é: o dia em que
// uma barra nova for acrescentada, todo bichinho já guardado vai estar sem ela,
// e `undefined` numa conta vira `NaN` que se espalha pelo estado inteiro em
// silêncio. Com a versão, dá para migrar — ou, no pior caso, recomeçar de
// propósito em vez de por acidente.

const CHAVE = 'bichinho.v1';
const VERSAO_ATUAL = 1;

function guardar(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));

    return true;
  } catch (erro) {
    // Navegação anônima com armazenamento bloqueado, cota cheia, permissão
    // negada. O brinquedo continua funcionando — só esquece tudo ao fechar, e
    // é melhor isso do que uma tela de erro.
    console.warn('não deu para guardar o bichinho:', erro);

    return false;
  }
}

function recuperar() {
  let bruto;

  try {
    bruto = localStorage.getItem(CHAVE);
  } catch (erro) {
    console.warn('não deu para ler o bichinho:', erro);

    return null;
  }

  if (!bruto) {
    return null;
  }

  let estado;

  try {
    estado = JSON.parse(bruto);
  } catch {
    console.warn('o bichinho guardado estava corrompido; nascendo outro');

    return null;
  }

  return migrar(estado);
}

// Hoje só existe a versão 1. A função existe para que a segunda não precise de
// uma reforma — e para que um estado de versão desconhecida seja recusado em
// vez de carregado pela metade.
function migrar(estado) {
  if (!estado || typeof estado !== 'object') {
    return null;
  }

  if (estado.versao !== VERSAO_ATUAL) {
    console.warn(`bichinho da versão ${estado.versao}; esta é a ${VERSAO_ATUAL}`);

    return null;
  }

  if (!conferir(estado)) {
    console.warn('o bichinho guardado está incompleto; nascendo outro');

    return null;
  }

  return estado;
}

// Uma conferência rasa do formato. Ela não valida tudo — valida o suficiente
// para que um estado torto não vire `NaN` espalhado pela tela.
function conferir(estado) {
  if (!estado.personalidade || typeof estado.personalidade.semente !== 'number') {
    return false;
  }

  if (!estado.necessidades) {
    return false;
  }

  for (const qual of NECESSIDADES) {
    const valor = estado.necessidades[qual];

    if (typeof valor !== 'number' || Number.isNaN(valor)) {
      return false;
    }
  }

  return typeof estado.ultimoTique === 'number'
    && typeof estado.minutosDeVida === 'number'
    && typeof estado.saude === 'number';
}

function esquecer() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // Se não deu para apagar, o próximo `guardar` sobrescreve.
  }
}
