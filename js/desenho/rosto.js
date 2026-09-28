// O rosto — que é onde mora praticamente toda a expressão.
//
// Vale a pena notar quão pouco é preciso: dois pontos e uma curva. Um arco para
// baixo é alegria, para cima é tristeza, uma linha reta é tédio. O resto do
// corpo pode ficar igual.
//
// É por isso que o rosto é um arquivo separado do corpo: o corpo muda de
// formato por personalidade, e o rosto muda de forma por humor. São dois eixos
// independentes, e misturá-los daria dezesseis funções em vez de duas.

// Quanto a boca curva, por humor. Positivo é sorriso.
const CURVAS = {
  otimo: 1,
  bem: 0.55,
  chateado: -0.35,
  mal: -0.8,
  doente: -0.6,
  dormindo: 0.2,
  morto: 0,
};

function desenharRosto(pincel, x, y, raio, escala, humor, cores, personalidade, instante) {
  const largura = raio * escala;
  const altura = raio * escala;
  const separacao = largura * 0.38 * personalidade.olhos;

  pincel.save();
  pincel.translate(x, y);

  desenharOlhos(pincel, separacao, altura, humor, cores, instante);
  desenharBoca(pincel, largura, altura, humor, cores, instante);

  if (humor === 'otimo') {
    desenharBochechas(pincel, largura, altura, personalidade);
  }

  pincel.restore();
}

function desenharOlhos(pincel, separacao, altura, humor, cores, instante) {
  const y = -altura * 0.12;

  // O piscar é a única coisa aqui que usa o relógio. Ele não é periódico: a
  // conta faz o olho fechar por uns 120 ms a cada três segundos e pouco, o que
  // é irregular o bastante para não parecer um metrônomo.
  const fase = (instante % 3300) / 3300;
  const piscando = fase > 0.965;

  for (const lado of [-1, 1]) {
    const cx = lado * separacao;

    if (humor === 'morto') {
      // Dois xis. O desenho mais universal que existe.
      pincel.strokeStyle = cores.olho;
      pincel.lineWidth = 3;
      pincel.beginPath();
      pincel.moveTo(cx - 5, y - 5);
      pincel.lineTo(cx + 5, y + 5);
      pincel.moveTo(cx + 5, y - 5);
      pincel.lineTo(cx - 5, y + 5);
      pincel.stroke();

      continue;
    }

    if (humor === 'dormindo' || piscando) {
      // Olho fechado: um arco para baixo.
      pincel.strokeStyle = cores.olho;
      pincel.lineWidth = 3;
      pincel.lineCap = 'round';
      pincel.beginPath();
      pincel.arc(cx, y, 6, Math.PI * 0.15, Math.PI * 0.85);
      pincel.stroke();

      continue;
    }

    const alturaDoOlho = humor === 'chateado' || humor === 'mal' || humor === 'doente'
      ? 5
      : 7;

    pincel.fillStyle = cores.olho;
    pincel.beginPath();
    pincel.ellipse(cx, y, 5, alturaDoOlho, 0, 0, Math.PI * 2);
    pincel.fill();

    // O pontinho de luz. Sem ele o olho fica morto mesmo com o bicho vivo.
    pincel.fillStyle = '#ffffff';
    pincel.beginPath();
    pincel.arc(cx - 1.6, y - 2.2, 1.8, 0, Math.PI * 2);
    pincel.fill();
  }

  // Sobrancelhas, só para os humores ruins. Elas fazem mais diferença do que
  // parece: sem elas, "chateado" e "bem" se distinguem muito pouco.
  if (humor === 'mal' || humor === 'doente') {
    pincel.strokeStyle = cores.olho;
    pincel.lineWidth = 2.5;
    pincel.lineCap = 'round';

    for (const lado of [-1, 1]) {
      pincel.beginPath();
      pincel.moveTo(lado * separacao - 6, y - 11);
      pincel.lineTo(lado * separacao + 6, y - 14 + lado * 0);
      pincel.stroke();
    }
  }
}

function desenharBoca(pincel, largura, altura, humor, cores, instante) {
  const y = altura * 0.3;
  const curva = CURVAS[humor] ?? 0;

  pincel.strokeStyle = cores.olho;
  pincel.lineWidth = 2.5;
  pincel.lineCap = 'round';

  if (humor === 'dormindo') {
    // Uma bolha de sono, que cresce e estoura.
    const fase = (instante % 2600) / 2600;
    const tamanho = 2 + fase * 6;

    pincel.beginPath();
    pincel.arc(largura * 0.22, y + 2, tamanho, 0, Math.PI * 2);
    pincel.globalAlpha = 0.5 * (1 - fase);
    pincel.fillStyle = '#ffffff';
    pincel.fill();
    pincel.globalAlpha = 1;
    pincel.stroke();

    return;
  }

  if (humor === 'morto') {
    pincel.beginPath();
    pincel.moveTo(-7, y);
    pincel.lineTo(7, y);
    pincel.stroke();

    return;
  }

  const meia = largura * 0.28;

  pincel.beginPath();
  pincel.moveTo(-meia, y);
  pincel.quadraticCurveTo(0, y + curva * 11, meia, y);
  pincel.stroke();

  // A boca aberta do "ótimo" é preenchida — é o que separa um sorriso de um
  // sorrisão.
  if (humor === 'otimo') {
    pincel.fillStyle = 'rgba(0,0,0,.18)';
    pincel.beginPath();
    pincel.moveTo(-meia, y);
    pincel.quadraticCurveTo(0, y + 11, meia, y);
    pincel.closePath();
    pincel.fill();
  }
}

function desenharBochechas(pincel, largura, altura, personalidade) {
  pincel.fillStyle = `hsl(${(personalidade.matiz + 330) % 360} 80% 74% / .55)`;

  for (const lado of [-1, 1]) {
    pincel.beginPath();
    pincel.ellipse(lado * largura * 0.6, altura * 0.22, 6, 4, 0, 0, Math.PI * 2);
    pincel.fill();
  }
}
