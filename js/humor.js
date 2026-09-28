// O humor: uma máquina de estados pequena, com histerese.
//
// A parte que parece boba e não é: sem histerese, um bichinho com a barra
// oscilando em volta do limite fica trocando de cara dez vezes por segundo. O
// jeito de resolver é o mesmo do termostato — o limite para entrar num estado
// é diferente do limite para sair dele.

const HUMORES = {
  otimo: { nome: 'ótimo', entra: 80, sai: 72 },
  bem: { nome: 'bem', entra: 55, sai: 48 },
  chateado: { nome: 'chateado', entra: 30, sai: 25 },
  mal: { nome: 'mal', entra: 0, sai: 0 },
};

// Do melhor para o pior. A ordem importa: a busca para no primeiro que serve.
const ORDEM = ['otimo', 'bem', 'chateado', 'mal'];

// Estados que não saem do contentamento: eles vêm de outra coisa e mandam mais
// que ele.
const DORMINDO = 'dormindo';
const DOENTE = 'doente';
const MORTO = 'morto';

function humorPara(contentamento, humorAtual) {
  for (const chave of ORDEM) {
    const faixa = HUMORES[chave];

    // Se já está neste humor, basta não ter caído abaixo do limite de saída.
    if (chave === humorAtual && contentamento >= faixa.sai) {
      return chave;
    }

    if (contentamento >= faixa.entra) {
      return chave;
    }
  }

  return 'mal';
}

// O humor que a interface mostra, já com as exceções na frente.
function humorVisivel(bichinho) {
  if (!bichinho.vivo) {
    return MORTO;
  }

  if (bichinho.doente) {
    return DOENTE;
  }

  if (bichinho.dormindo) {
    return DORMINDO;
  }

  return bichinho.humor;
}

// A frase que ele diz. É onde o brinquedo ganha personalidade, e por isso ela
// olha a necessidade mais urgente antes de olhar o humor: "tô com fome" diz
// mais do que "tô chateado".
const FALAS = {
  morto: ['...'],
  doente: ['não tô bem...', 'acho que comi demais', 'me dá um remédio?'],
  dormindo: ['zzz...', 'zzZ', 'zzz'],
  fome: ['tô com fome!', 'cadê a comida?', 'meu estômago tá roncando'],
  energia: ['tô com sono...', 'que soninho', 'me deixa dormir?'],
  diversao: ['tô entediado', 'brinca comigo!', 'nada pra fazer...'],
  higiene: ['eca', 'tô sujo', 'preciso de um banho'],
  otimo: ['oi!', 'tudo ótimo!', 'te amo', 'que dia bom'],
  bem: ['oi', 'tudo bem', 'to de boa'],
  chateado: ['hum...', 'tô meio pra baixo', 'sei lá'],
  mal: ['tô péssimo', 'me ajuda', 'que dia ruim'],
};

function falaDe(bichinho, sorteio) {
  const visivel = humorVisivel(bichinho);

  if (visivel === MORTO || visivel === DOENTE || visivel === DORMINDO) {
    return sorteio.entre(FALAS[visivel]);
  }

  const urgente = maisUrgente(bichinho.necessidades);

  if (urgente) {
    return sorteio.entre(FALAS[urgente]);
  }

  return sorteio.entre(FALAS[bichinho.humor]);
}
