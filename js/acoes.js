// O que a pessoa pode fazer: alimentar, brincar, limpar, remediar, apagar a luz.
//
// Cada ação devolve um estado novo e uma mensagem. Nenhuma altera o estado no
// lugar, pelo mesmo motivo de sempre: é assim que dá para testar uma ação sem
// montar o jogo inteiro em volta.
//
// E todas recusam, com uma frase, quando não fazem sentido. Um botão que
// funciona em silêncio quando não devia é pior do que um botão travado — a
// pessoa fica sem saber se o brinquedo entendeu.

function recusa(mensagem) {
  return { feito: false, mensagem };
}

function feito(estado, mensagem, som) {
  return { feito: true, estado, mensagem, som };
}

function alimentar(estado) {
  if (!estado.vivo) {
    return recusa('ele não está mais aqui');
  }

  if (estado.dormindo) {
    return recusa('shh, ele está dormindo');
  }

  if (estado.necessidades.fome >= 95) {
    // Comer sem fome não é neutro: empanturra. É a única ação que pode
    // piorar as coisas, e ela existe para que "apertar tudo o tempo todo" não
    // seja a melhor estratégia.
    return feito(
      {
        ...estado,
        necessidades: {
          ...estado.necessidades,
          fome: 100,
          higiene: limitarBarra(estado.necessidades.higiene - 8),
        },
        saude: limitarBarra(estado.saude - 4),
        vezesAlimentado: estado.vezesAlimentado + 1,
      },
      'ele comeu demais...',
      'ruim',
    );
  }

  return feito(
    {
      ...estado,
      necessidades: {
        ...estado.necessidades,
        fome: limitarBarra(estado.necessidades.fome + 35),
        higiene: limitarBarra(estado.necessidades.higiene - 4),
      },
      vezesAlimentado: estado.vezesAlimentado + 1,
    },
    `${estado.personalidade.nome} comeu ${estado.personalidade.comida}`,
    'comer',
  );
}

function brincar(estado) {
  if (!estado.vivo) {
    return recusa('ele não está mais aqui');
  }

  if (estado.dormindo) {
    return recusa('shh, ele está dormindo');
  }

  if (estado.necessidades.energia <= 15) {
    return recusa('ele está cansado demais para brincar');
  }

  return feito(
    {
      ...estado,
      necessidades: {
        ...estado.necessidades,
        diversao: limitarBarra(estado.necessidades.diversao + 40),
        energia: limitarBarra(estado.necessidades.energia - 12),
        fome: limitarBarra(estado.necessidades.fome - 6),
      },
      vezesQueBrincou: estado.vezesQueBrincou + 1,
    },
    'brincaram juntos!',
    'brincar',
  );
}

function limpar(estado) {
  if (!estado.vivo) {
    return recusa('ele não está mais aqui');
  }

  if (estado.sujeiras === 0 && estado.necessidades.higiene >= 95) {
    return recusa('já está tudo limpo');
  }

  return feito(
    {
      ...estado,
      necessidades: {
        ...estado.necessidades,
        higiene: 100,
      },
      sujeiras: 0,
      vezesQueLimpou: estado.vezesQueLimpou + 1,
    },
    'tudo limpo',
    'limpar',
  );
}

function remediar(estado) {
  if (!estado.vivo) {
    return recusa('ele não está mais aqui');
  }

  if (!estado.doente) {
    // Remédio sem doença faz mal, como remédio de verdade.
    return feito(
      {
        ...estado,
        saude: limitarBarra(estado.saude - 6),
        remediosDados: estado.remediosDados + 1,
      },
      'ele não estava doente...',
      'ruim',
    );
  }

  return feito(
    {
      ...estado,
      doente: false,
      saude: limitarBarra(estado.saude + 20),
      remediosDados: estado.remediosDados + 1,
    },
    'melhorou!',
    'remedio',
  );
}

// Apagar a luz não força o sono: ele dorme se estiver com sono. Forçar seria
// tirar a única coisa que o bichinho decide sozinho.
function apagarALuz(estado) {
  if (!estado.vivo) {
    return recusa('ele não está mais aqui');
  }

  if (estado.dormindo) {
    return feito({ ...estado, dormindo: false }, 'acordou', 'acordar');
  }

  if (estado.necessidades.energia > 70) {
    return recusa('ele não está com sono');
  }

  return feito({ ...estado, dormindo: true }, 'boa noite...', 'dormir');
}

const ACOES = {
  alimentar: { nome: 'Alimentar', icone: '🍕', funcao: alimentar, tecla: '1' },
  brincar: { nome: 'Brincar', icone: '🎈', funcao: brincar, tecla: '2' },
  limpar: { nome: 'Limpar', icone: '🧼', funcao: limpar, tecla: '3' },
  remediar: { nome: 'Remédio', icone: '💊', funcao: remediar, tecla: '4' },
  luz: { nome: 'Luz', icone: '💡', funcao: apagarALuz, tecla: '5' },
};
