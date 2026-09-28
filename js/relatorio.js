// "Enquanto você não estava..." — o relatório da ausência.
//
// É a tela que dá sentido ao tempo correr com a aba fechada. Sem ela, a pessoa
// volta, vê as barras baixas e não entende por quê; com ela, o brinquedo conta
// o que aconteceu.
//
// A lista de eventos vem crua do avanço dos minutos e chega aqui com
// repetições — "fez sujeira" quatro vezes, "foi dormir" e "acordou" seis vezes.
// O trabalho deste arquivo é transformar isso em três ou quatro frases que uma
// pessoa lê.

// Os eventos que merecem ser contados, e como contá-los quando se repetem.
const CONTAGEM = {
  'fez sujeira': (quantas) => (quantas === 1 ? 'fez uma sujeira' : `fez ${quantas} sujeiras`),
  adoeceu: (quantas) => (quantas === 1 ? 'ficou doente' : `ficou doente ${quantas} vezes`),
  'foi dormir': (quantas) => (quantas === 1 ? 'tirou um cochilo' : `dormiu ${quantas} vezes`),
};

// Estes aparecem uma vez só, e ganham destaque.
const IMPORTANTES = ['morreu'];

function montarRelatorio(antes, depois, eventos, minutosFora) {
  const linhas = [];
  const contagens = new Map();
  const evolucoes = [];

  for (const evento of eventos) {
    if (evento.startsWith('virou ')) {
      evolucoes.push(evento.slice('virou '.length));
      continue;
    }

    contagens.set(evento, (contagens.get(evento) ?? 0) + 1);
  }

  // A evolução vem primeiro porque é a boa notícia.
  if (evolucoes.length > 0) {
    const ultimo = evolucoes[evolucoes.length - 1];
    linhas.push(`virou ${ultimo}`);
  }

  for (const [evento, quantas] of contagens) {
    if (IMPORTANTES.includes(evento)) {
      continue;
    }

    const formatar = CONTAGEM[evento];

    if (formatar) {
      linhas.push(formatar(quantas));
    }
  }

  // O que mais caiu, em números — é o que explica as barras vermelhas.
  const pior = maiorQueda(antes.necessidades, depois.necessidades);

  if (pior) {
    linhas.push(`a ${NOMES[pior.qual].toLowerCase()} caiu ${Math.round(pior.quanto)} pontos`);
  }

  if (depois.doente && !antes.doente) {
    linhas.push('está doente e precisa de remédio');
  }

  // A morte vai por último e sempre entra, mesmo que a lista já esteja cheia.
  // Era o único evento que aparecia só no título — e um título que muda é
  // fácil de não notar.
  if (contagens.has('morreu')) {
    linhas.push('não resistiu');
  }

  const morreu = contagens.has('morreu');

  return {
    tempo: emPalavras(minutosFora),
    // Quatro linhas no máximo — e, se morreu, a última é sempre essa.
    linhas: morreu
      ? [...linhas.filter((l) => l !== 'não resistiu').slice(0, 3), 'não resistiu']
      : linhas.slice(0, 4),
    morreu,
    nada: linhas.length === 0,
  };
}

function maiorQueda(antes, depois) {
  let pior = null;

  for (const qual of NECESSIDADES) {
    const quanto = antes[qual] - depois[qual];

    if (quanto < 12) {
      continue;
    }

    if (pior === null || quanto > pior.quanto) {
      pior = { qual, quanto };
    }
  }

  return pior;
}

// Só vale mostrar a partir de uns minutos. Voltar depois de trinta segundos e
// levar um relatório é ruído.
const MINIMO_PARA_CONTAR = 5;

function valeContar(minutosFora) {
  return minutosFora >= MINIMO_PARA_CONTAR;
}
