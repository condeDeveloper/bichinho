// As cores, todas derivadas de um número.
//
// A personalidade guarda um matiz — um ângulo de 0 a 360 — e daí sai a paleta
// inteira: corpo, sombra, barriga, brilho. É o mesmo truque do `conde-play`, e
// ele resolve dois problemas de uma vez: não há arquivo de imagem no
// repositório, e dois bichinhos de matizes vizinhos nunca saem parecidos,
// porque a distância entre eles é escolhida na hora de sortear.
//
// O HSL existe exatamente para isto. Em RGB, clarear uma cor é mexer em três
// números e torcer; em HSL é somar na luminosidade.

function hsl(matiz, saturacao, luz, alfa = 1) {
  return alfa === 1
    ? `hsl(${matiz} ${saturacao}% ${luz}%)`
    : `hsl(${matiz} ${saturacao}% ${luz}% / ${alfa})`;
}

// A paleta do bichinho. `doente` dessatura tudo — é o jeito mais direto de uma
// tela dizer "algo está errado" sem escrever nada.
function paletaDo(personalidade, { doente = false, morto = false } = {}) {
  const matiz = personalidade.matiz;

  if (morto) {
    return {
      corpo: hsl(matiz, 6, 62),
      sombra: hsl(matiz, 6, 48),
      barriga: hsl(matiz, 5, 74),
      brilho: hsl(matiz, 4, 82),
      contorno: hsl(matiz, 10, 32),
      olho: hsl(matiz, 8, 30),
    };
  }

  const saturacao = doente ? 24 : 62;

  return {
    corpo: hsl(matiz, saturacao, 68),
    sombra: hsl(matiz, saturacao, 56),
    barriga: hsl(matiz, saturacao - 14, 84),
    brilho: hsl(matiz, saturacao - 30, 94),
    contorno: hsl(matiz, saturacao, 34),
    olho: hsl(matiz, 40, 18),
  };
}

// O cenário muda com a hora do relógio de quem está olhando. É um detalhe
// pequeno e é o que faz o brinquedo parecer vivo quando alguém abre de
// madrugada.
function paletaDoCenario(ehNoite) {
  if (ehNoite) {
    return {
      ceuAlto: '#1b2145',
      ceuBaixo: '#39325c',
      chao: '#2a2446',
      chaoRiscos: 'rgba(255,255,255,.05)',
      astro: '#e8e4ff',
      astroBrilho: 'rgba(232,228,255,.18)',
      estrelas: true,
    };
  }

  return {
    ceuAlto: '#bfe6ff',
    ceuBaixo: '#ffe9c9',
    chao: '#a8dba0',
    chaoRiscos: 'rgba(255,255,255,.22)',
    astro: '#ffd36b',
    astroBrilho: 'rgba(255,211,107,.28)',
    estrelas: false,
  };
}

// A cor de uma barrinha, pelo quanto ela tem. Verde, amarelo, vermelho — e o
// vermelho pisca, mas isso é do CSS.
function corDaBarra(valor) {
  if (valor > 60) return '#4ade80';
  if (valor > 35) return '#facc15';
  if (valor > 15) return '#fb923c';

  return '#f87171';
}
