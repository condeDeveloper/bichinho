// O laço de desenho: monta a cena inteira a cada quadro.
//
// Uma função só, chamada sessenta vezes por segundo, que lê o estado e escreve
// pixels. Ela não decide nada — não muda humor, não gasta energia, não guarda
// nada entre quadros além das partículas. Se o desenho decidisse qualquer
// coisa, fechar a aba mudaria o jogo.

// O tamanho em que o desenho pensa. Tudo aqui dentro usa estas coordenadas,
// e a tela de verdade pode ser maior — é o CSS que decide o tamanho na página.
const LARGURA = 320;
const ALTURA = 240;

function criarTela(canvas) {
  const particulas = criarParticulas();

  // A tela é desenhada numa resolução maior que a lógica e encolhida pelo CSS.
  //
  // O caminho mais curto seria desenhar em 320 por 240 e deixar o navegador
  // esticar, e foi o que esta função fazia. O problema é que o bichinho é
  // feito de **curvas**: num desenho de pixels, esticar é retrô; num desenho
  // de curvas, é só borrado. Desenhar grande e encolher resolve — e a conta é
  // a mesma, porque o `scale` faz o resto do arquivo continuar falando em 320
  // por 240.
  const densidade = Math.min(3, Math.max(2, window.devicePixelRatio || 1));

  canvas.width = LARGURA * densidade;
  canvas.height = ALTURA * densidade;

  const pincel = canvas.getContext('2d');
  pincel.scale(densidade, densidade);

  const largura = LARGURA;
  const altura = ALTURA;

  let ultimaFala = { texto: '', ate: 0 };

  return {
    particulas,

    falar(texto, duracao = 2600) {
      ultimaFala = { texto, ate: performance.now() + duracao };
    },

    soltar(tipo, quantas = 1) {
      soltar(particulas, tipo, largura / 2, altura * 0.42, quantas);
    },

    desenhar(estado, instante, ehNoite) {
      const cores = paletaDoCenario(ehNoite && !estado.dormindo ? true : ehNoite);

      desenharCenario(pincel, largura, altura, cores, instante);
      desenharSujeiras(pincel, largura, altura, estado.sujeiras, instante);

      if (estaNoOvo(estado.minutosDeVida)) {
        desenharOvo(pincel, largura, altura, estado, instante);
      } else {
        desenharBichinho(pincel, largura, altura, estado, instante);
      }

      atualizarParticulas(particulas, instante);
      desenharParticulas(pincel, particulas, instante);

      if (instante < ultimaFala.ate) {
        desenharBalao(pincel, largura, altura, ultimaFala.texto);
      }
    },
  };
}

function desenharBichinho(pincel, largura, altura, estado, instante) {
  const humor = humorVisivel(estado);
  const cores = paletaDo(estado.personalidade, {
    doente: estado.doente,
    morto: !estado.vivo,
  });

  const estagio = estagioPara(estado.minutosDeVida);
  const raio = 34 * estagio.tamanho;
  const balanco = estado.personalidade.balanco;

  // Três animações somadas, e cada uma com um período diferente para que o
  // conjunto não bata o compasso: o quique, a respiração e o passo.
  const parado = !estado.vivo;
  const quique = parado ? 0 : Math.abs(Math.sin(instante / 420 * balanco)) * 6;
  const respirar = parado ? 1 : 1 + Math.sin(instante / 900) * 0.03;
  const passo = parado || estado.dormindo
    ? 0
    : Math.sin(instante / 1400) * largura * 0.13;

  const x = largura / 2 + passo;
  const y = altura * 0.58 - quique;

  // Agachado quando dorme, esticado quando pula.
  const achatar = estado.dormindo ? 0.72 : 1 - quique / 90;

  desenharCorpo(pincel, x, y, raio, respirar, achatar, cores, estado.personalidade);
  desenharRosto(pincel, x, y, raio, respirar, humor, cores, estado.personalidade, instante);

  if (estado.dormindo) {
    soltarDeVezEmQuando(pincel, x + raio * 0.8, y - raio, instante);
  }
}

// Um z que sobe, sem passar pelo sistema de partículas — ele nasce e morre no
// mesmo quadro, e é mais barato assim.
function soltarDeVezEmQuando(pincel, x, y, instante) {
  for (let i = 0; i < 3; i++) {
    const fase = ((instante / 1800 + i * 0.33) % 1);

    pincel.globalAlpha = 0.7 * (1 - fase);
    pincel.fillStyle = '#e9d5ff';
    pincel.font = `bold ${10 + fase * 8}px system-ui, sans-serif`;
    pincel.fillText('z', x + fase * 16, y - fase * 34);
  }

  pincel.globalAlpha = 1;
}

// O ovo: uma elipse que treme cada vez mais forte à medida que a hora chega.
function desenharOvo(pincel, largura, altura, estado, instante) {
  const quaseLa = estado.minutosDeVida / 2;
  const tremor = Math.sin(instante / 90) * quaseLa * 3;

  const x = largura / 2 + tremor;
  const y = altura * 0.6;

  pincel.fillStyle = 'rgba(0,0,0,.16)';
  pincel.beginPath();
  pincel.ellipse(largura / 2, y + 36, 26, 6, 0, 0, Math.PI * 2);
  pincel.fill();

  pincel.fillStyle = '#fdf6e3';
  pincel.strokeStyle = '#c9b89a';
  pincel.lineWidth = 2.5;
  pincel.beginPath();
  pincel.ellipse(x, y, 26, 34, 0, 0, Math.PI * 2);
  pincel.fill();
  pincel.stroke();

  // As manchinhas saem do matiz do bichinho que está lá dentro. É uma pista
  // da cor que vai nascer.
  pincel.fillStyle = `hsl(${estado.personalidade.matiz} 45% 72%)`;

  for (let i = 0; i < 5; i++) {
    const angulo = i * 1.7;

    pincel.beginPath();
    pincel.ellipse(
      x + Math.cos(angulo) * 13,
      y + Math.sin(angulo) * 18,
      5, 4, angulo, 0, Math.PI * 2,
    );
    pincel.fill();
  }
}

// O balão de fala, com a pontinha virada para o bichinho.
function desenharBalao(pincel, largura, altura, texto) {
  pincel.font = 'bold 13px system-ui, -apple-system, sans-serif';
  pincel.textAlign = 'center';
  pincel.textBaseline = 'middle';

  const medida = pincel.measureText(texto);
  const caixa = { w: medida.width + 22, h: 28 };
  const x = largura / 2;
  const y = altura * 0.16;

  pincel.fillStyle = 'rgba(255,255,255,.94)';
  pincel.strokeStyle = 'rgba(0,0,0,.18)';
  pincel.lineWidth = 2;

  pincel.beginPath();
  pincel.roundRect(x - caixa.w / 2, y - caixa.h / 2, caixa.w, caixa.h, 12);
  pincel.fill();
  pincel.stroke();

  pincel.beginPath();
  pincel.moveTo(x - 7, y + caixa.h / 2 - 1);
  pincel.lineTo(x, y + caixa.h / 2 + 9);
  pincel.lineTo(x + 7, y + caixa.h / 2 - 1);
  pincel.closePath();
  pincel.fillStyle = 'rgba(255,255,255,.94)';
  pincel.fill();

  pincel.fillStyle = '#2b2b3a';
  pincel.fillText(texto, x, y);
}
