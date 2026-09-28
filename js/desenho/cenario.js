// O fundo: céu, sol ou lua, chão e as sujeiras.
//
// Desenhado antes de tudo e sem guardar nada — a cada quadro o cenário é
// refeito do zero. Num canvas de 320 por 240 isso não custa nada, e evita a
// classe inteira de defeito em que a tela guarda um pedaço velho.

function desenharCenario(pincel, largura, altura, cores, instante) {
  const ceu = pincel.createLinearGradient(0, 0, 0, altura);
  ceu.addColorStop(0, cores.ceuAlto);
  ceu.addColorStop(1, cores.ceuBaixo);

  pincel.fillStyle = ceu;
  pincel.fillRect(0, 0, largura, altura);

  if (cores.estrelas) {
    desenharEstrelas(pincel, largura, altura, instante);
  }

  desenharAstro(pincel, largura, altura, cores, instante);
  desenharChao(pincel, largura, altura, cores);
}

// As estrelas não são sorteadas a cada quadro: a posição sai de uma conta com o
// índice, então elas ficam paradas. Sorteá-las faria o céu tremer.
function desenharEstrelas(pincel, largura, altura, instante) {
  const quantas = 26;

  for (let i = 0; i < quantas; i++) {
    const x = ((i * 97) % largura) + ((i * 31) % 7);
    const y = ((i * 53) % Math.floor(altura * 0.55)) + 6;

    // O brilho pulsa com o tempo, cada uma no seu compasso.
    const brilho = 0.35 + 0.35 * Math.sin(instante / 700 + i * 1.7);

    pincel.fillStyle = `rgba(255,255,255,${brilho.toFixed(3)})`;
    pincel.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
  }
}

function desenharAstro(pincel, largura, altura, cores, instante) {
  const x = largura * 0.82;
  const y = altura * 0.2 + Math.sin(instante / 3000) * 3;
  const raio = 18;

  pincel.fillStyle = cores.astroBrilho;
  pincel.beginPath();
  pincel.arc(x, y, raio * 2.1, 0, Math.PI * 2);
  pincel.fill();

  pincel.fillStyle = cores.astro;
  pincel.beginPath();
  pincel.arc(x, y, raio, 0, Math.PI * 2);
  pincel.fill();

  // A lua é o sol com uma mordida — um círculo do tom do céu por cima. É o
  // truque mais velho do desenho em canvas e continua sendo o mais barato.
  if (cores.estrelas) {
    pincel.fillStyle = cores.ceuAlto;
    pincel.beginPath();
    pincel.arc(x - raio * 0.42, y - raio * 0.3, raio * 0.92, 0, Math.PI * 2);
    pincel.fill();
  }
}

function desenharChao(pincel, largura, altura, cores) {
  const linhaDoChao = altura * 0.74;

  pincel.fillStyle = cores.chao;
  pincel.beginPath();
  pincel.moveTo(0, linhaDoChao);

  // Uma ondinha, para o chão não ser uma régua.
  for (let x = 0; x <= largura; x += 8) {
    pincel.lineTo(x, linhaDoChao + Math.sin(x / 34) * 3);
  }

  pincel.lineTo(largura, altura);
  pincel.lineTo(0, altura);
  pincel.closePath();
  pincel.fill();

  pincel.strokeStyle = cores.chaoRiscos;
  pincel.lineWidth = 2;

  for (let i = 0; i < 9; i++) {
    const x = 14 + i * 36;
    const y = linhaDoChao + 16 + (i % 3) * 14;

    pincel.beginPath();
    pincel.moveTo(x, y);
    pincel.lineTo(x + 10, y - 5);
    pincel.stroke();
  }
}

// As sujeiras ficam no chão, espalhadas em posições fixas — não sorteadas, para
// que a primeira esteja sempre no mesmo lugar e a pessoa saiba onde olhar.
const LUGARES_DE_SUJEIRA = [
  { x: 0.18, y: 0.86 },
  { x: 0.74, y: 0.9 },
  { x: 0.4, y: 0.93 },
  { x: 0.88, y: 0.82 },
];

function desenharSujeiras(pincel, largura, altura, quantas, instante) {
  for (let i = 0; i < Math.min(quantas, LUGARES_DE_SUJEIRA.length); i++) {
    const lugar = LUGARES_DE_SUJEIRA[i];
    const x = largura * lugar.x;
    const y = altura * lugar.y;

    pincel.fillStyle = '#6b4a2f';
    pincel.beginPath();
    pincel.ellipse(x, y, 9, 6, 0, 0, Math.PI * 2);
    pincel.fill();

    pincel.beginPath();
    pincel.ellipse(x + 1, y - 5, 6, 4, 0, 0, Math.PI * 2);
    pincel.fill();

    pincel.fillStyle = 'rgba(0,0,0,.2)';
    pincel.beginPath();
    pincel.ellipse(x, y + 4, 10, 3, 0, 0, Math.PI * 2);
    pincel.fill();

    // As moscas. Elas não fazem nada e são metade da graça.
    pincel.fillStyle = 'rgba(40,40,40,.75)';

    for (let m = 0; m < 2; m++) {
      const angulo = instante / 260 + i * 2 + m * Math.PI;
      const mx = x + Math.cos(angulo) * 13;
      const my = y - 10 + Math.sin(angulo * 1.7) * 6;

      pincel.fillRect(mx, my, 2, 2);
    }
  }
}
