// Corações, zês, migalhas — as coisinhas que sobem e somem.
//
// Um sistema de partículas de brinquedo, e o mínimo que ele precisa ter para
// não estragar a tela: um teto no número de partículas, e remoção das que já
// passaram do tempo. Sem as duas coisas, apertar um botão cem vezes deixa
// mil corações na memória para sempre.

const TETO = 60;

function criarParticulas() {
  return { itens: [] };
}

const TIPOS = {
  coracao: { cor: '#ff7a9c', sobe: 26, vida: 1100, tamanho: 9 },
  nota: { cor: '#7dd3fc', sobe: 32, vida: 1200, tamanho: 10 },
  zzz: { cor: '#c4b5fd', sobe: 18, vida: 2200, tamanho: 12 },
  migalha: { cor: '#d9a066', sobe: -10, vida: 700, tamanho: 4 },
  bolha: { cor: '#bae6fd', sobe: 22, vida: 1400, tamanho: 7 },
  raiva: { cor: '#f87171', sobe: 20, vida: 900, tamanho: 9 },
};

function soltar(particulas, tipo, x, y, quantas = 1) {
  for (let i = 0; i < quantas; i++) {
    if (particulas.itens.length >= TETO) {
      // Descarta a mais velha em vez de recusar a nova: o efeito visual de
      // continuar saindo importa mais do que a partícula específica.
      particulas.itens.shift();
    }

    particulas.itens.push({
      tipo,
      x: x + (Math.random() - 0.5) * 22,
      y: y + (Math.random() - 0.5) * 10,
      nascimento: performance.now(),
      deriva: (Math.random() - 0.5) * 18,
      giro: (Math.random() - 0.5) * 2,
    });
  }
}

function atualizarParticulas(particulas, agora) {
  particulas.itens = particulas.itens.filter(
    (item) => agora - item.nascimento < TIPOS[item.tipo].vida,
  );
}

function desenharParticulas(pincel, particulas, agora) {
  for (const item of particulas.itens) {
    const regra = TIPOS[item.tipo];
    const idade = (agora - item.nascimento) / regra.vida;

    if (idade >= 1) {
      continue;
    }

    const x = item.x + item.deriva * idade;
    const y = item.y - regra.sobe * idade * 2.2;

    // Some no fim, e nasce crescendo. As duas coisas juntas fazem a partícula
    // parecer que veio de algum lugar em vez de piscar na tela.
    pincel.globalAlpha = idade < 0.15 ? idade / 0.15 : 1 - (idade - 0.15) / 0.85;

    pincel.save();
    pincel.translate(x, y);
    pincel.rotate(item.giro * idade);

    const tamanho = regra.tamanho * (0.6 + idade * 0.5);

    desenharForma(pincel, item.tipo, tamanho, regra.cor);

    pincel.restore();
  }

  pincel.globalAlpha = 1;
}

function desenharForma(pincel, tipo, tamanho, cor) {
  pincel.fillStyle = cor;

  switch (tipo) {
    case 'coracao':
      // Dois arcos e uma ponta. É o mesmo desenho que todo mundo faz à mão.
      pincel.beginPath();
      pincel.moveTo(0, tamanho * 0.35);
      pincel.bezierCurveTo(-tamanho, -tamanho * 0.4, -tamanho * 0.4, -tamanho, 0, -tamanho * 0.3);
      pincel.bezierCurveTo(tamanho * 0.4, -tamanho, tamanho, -tamanho * 0.4, 0, tamanho * 0.35);
      pincel.fill();
      break;

    case 'zzz':
      pincel.font = `bold ${tamanho}px system-ui, sans-serif`;
      pincel.textAlign = 'center';
      pincel.fillText('z', 0, 0);
      break;

    case 'nota':
      pincel.beginPath();
      pincel.ellipse(-tamanho * 0.2, tamanho * 0.3, tamanho * 0.32, tamanho * 0.24, -0.4, 0, Math.PI * 2);
      pincel.fill();
      pincel.fillRect(tamanho * 0.05, -tamanho * 0.6, tamanho * 0.12, tamanho * 0.95);
      break;

    case 'raiva':
      pincel.strokeStyle = cor;
      pincel.lineWidth = 2.5;
      pincel.beginPath();
      pincel.moveTo(-tamanho * 0.4, -tamanho * 0.4);
      pincel.lineTo(tamanho * 0.4, tamanho * 0.4);
      pincel.moveTo(tamanho * 0.4, -tamanho * 0.4);
      pincel.lineTo(-tamanho * 0.4, tamanho * 0.4);
      pincel.stroke();
      break;

    default:
      pincel.beginPath();
      pincel.arc(0, 0, tamanho * 0.5, 0, Math.PI * 2);
      pincel.fill();
      break;
  }
}
