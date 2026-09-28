// O bichinho: o estado inteiro num objeto só, e o minuto que passa.
//
// Tudo o que define o bichinho cabe aqui, e de propósito: é este objeto que vai
// para o armazenamento, é ele que o desenho lê, e é ele que o minuto
// transforma. Não há estado escondido em lugar nenhum — o que a tela mostra é
// função disto e de mais nada.

function nascer(semente = semearAgora(), agora = Date.now()) {
  return {
    versao: 1,
    personalidade: sortearPersonalidade(semente),

    nascimento: agora,
    ultimoTique: agora,
    minutosDeVida: 0,

    necessidades: criarNecessidades(),
    saude: 100,
    humor: 'otimo',

    dormindo: false,
    doente: false,
    vivo: true,
    sujeiras: 0,

    // Contadores, só para o painel e para a pessoa se orgulhar.
    vezesAlimentado: 0,
    vezesQueBrincou: 0,
    vezesQueLimpou: 0,
    remediosDados: 0,
  };
}

// Um minuto de vida. É a única função que muda o bichinho com o tempo — todo o
// resto é ação da pessoa.
//
// Devolve o estado novo e a lista do que aconteceu. Separar as duas coisas é o
// que permite rodar mil minutos de ausência e ainda contar a história depois.
function passarUmMinuto(estado, sorteio, instante) {
  if (!estado.vivo) {
    return { estado, eventos: [] };
  }

  const eventos = [];
  const minutosDeVida = estado.minutosDeVida + 1;

  if (evoluiu(estado.minutosDeVida, minutosDeVida)) {
    eventos.push(`virou ${estagioPara(minutosDeVida).nome}`);
  }

  // No ovo nada acontece. É a carência do brinquedo.
  if (estaNoOvo(minutosDeVida)) {
    return { estado: { ...estado, minutosDeVida }, eventos };
  }

  const dormindo = decidirSono(estado, instante);

  if (dormindo && !estado.dormindo) {
    eventos.push('foi dormir');
  } else if (!dormindo && estado.dormindo) {
    eventos.push('acordou');
  }

  const necessidades = passarMinuto(estado.necessidades, dormindo, estado.sujeiras);
  const comNecessidades = { ...estado, necessidades, dormindo, minutosDeVida };

  const { saude, doente, vivo, eventos: deSaude } =
    passarMinutoDeSaude(comNecessidades, sorteio);

  eventos.push(...deSaude);

  const sujeiras = talvezSujar({ ...comNecessidades, vivo }, sorteio);

  if (sujeiras > estado.sujeiras) {
    eventos.push('fez sujeira');
  }

  const humor = humorPara(contentamento(necessidades), estado.humor);

  return {
    estado: {
      ...comNecessidades,
      saude,
      doente,
      vivo,
      sujeiras,
      humor,
      ultimoTique: instante,
    },
    eventos,
  };
}

// Quando ele dorme. Duas razões, e a ordem entre elas importa: um bichinho
// exausto dorme de dia, mas um bichinho descansado não fica acordado de
// madrugada.
function decidirSono(estado, instante) {
  if (estado.necessidades.energia <= 8) {
    return true;
  }

  if (estado.dormindo && estado.necessidades.energia < 95) {
    // Uma vez dormindo, só acorda quando estiver quase cheio — senão ele
    // cochila e acorda a cada minuto.
    return true;
  }

  const relogio = criarRelogio();

  return relogio.ehNoite(instante) && estado.necessidades.energia < 70;
}

// Roda muitos minutos de uma vez, e junta os eventos. É o que a volta de uma
// ausência usa.
function avancar(estado, minutos, instanteFinal) {
  const sorteio = criarSorteio(estado.personalidade.semente ^ estado.minutosDeVida);
  const eventos = [];
  let atual = estado;

  for (let i = 0; i < minutos; i++) {
    // O instante de cada minuto simulado é reconstruído para trás, para que o
    // dia e a noite de cada um deles sejam os de verdade — um bichinho que
    // some das 18h às 8h tem de ter dormido no meio.
    const instante = instanteFinal - (minutos - 1 - i) * 60 * 1000;
    const passo = passarUmMinuto(atual, sorteio, instante);

    atual = passo.estado;
    eventos.push(...passo.eventos);

    if (!atual.vivo) {
      break;
    }
  }

  return { estado: { ...atual, ultimoTique: instanteFinal }, eventos };
}
