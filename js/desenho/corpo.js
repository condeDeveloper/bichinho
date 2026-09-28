// O corpo, em quatro formatos — e nenhum arquivo de imagem.
//
// Tudo sai de `bezierCurveTo` e `arc`. A razão não é purismo: é que um corpo
// desenhado por conta aceita ser esticado, inclinado e colorido em tempo de
// execução, e um PNG não. O bichinho infla quando come, encolhe quando está
// mal e muda de cor quando adoece — com imagem, seriam dezenas de arquivos.

// Desenha o corpo centrado em (x, y), com `escala` de tamanho.
// `achatar` é o quique: 1 é redondo, 0.9 é agachado.
function desenharCorpo(pincel, x, y, raio, escala, achatar, cores, personalidade) {
  const largura = raio * escala;
  const altura = raio * escala * achatar;

  pincel.save();
  pincel.translate(x, y);

  desenharSombraNoChao(pincel, largura, altura);
  desenharOrelhas(pincel, largura, altura, cores, personalidade.orelhas);

  pincel.fillStyle = cores.corpo;
  pincel.strokeStyle = cores.contorno;
  pincel.lineWidth = 2.5;

  caminhoDoCorpo(pincel, largura, altura, personalidade.corpo);
  pincel.fill();
  pincel.stroke();

  desenharBarriga(pincel, largura, altura, cores);
  desenharBrilho(pincel, largura, altura, cores);
  desenharPes(pincel, largura, altura, cores);

  pincel.restore();
}

// Os quatro formatos. Cada um é um caminho fechado em volta da origem.
function caminhoDoCorpo(pincel, largura, altura, formato) {
  pincel.beginPath();

  switch (formato) {
    case 'gotinha':
      // Pontuda em cima, gorda embaixo.
      pincel.moveTo(0, -altura * 1.15);
      pincel.bezierCurveTo(largura * 0.9, -altura * 0.5, largura, altura * 0.6, 0, altura);
      pincel.bezierCurveTo(-largura, altura * 0.6, -largura * 0.9, -altura * 0.5, 0, -altura * 1.15);
      break;

    case 'quadradinho':
      // Um quadrado de cantos muito arredondados. O `arcTo` faz o canto sem
      // precisar calcular onde a curva começa.
      {
        const canto = Math.min(largura, altura) * 0.42;

        pincel.moveTo(-largura + canto, -altura);
        pincel.arcTo(largura, -altura, largura, altura, canto);
        pincel.arcTo(largura, altura, -largura, altura, canto);
        pincel.arcTo(-largura, altura, -largura, -altura, canto);
        pincel.arcTo(-largura, -altura, largura, -altura, canto);
      }
      break;

    case 'nuvem':
      // Três bolhas em cima de uma base achatada.
      pincel.ellipse(0, altura * 0.18, largura, altura * 0.82, 0, 0, Math.PI * 2);
      pincel.closePath();
      pincel.moveTo(-largura * 0.45, -altura * 0.45);
      pincel.arc(-largura * 0.42, -altura * 0.42, largura * 0.42, 0, Math.PI * 2);
      pincel.moveTo(largura * 0.45, -altura * 0.38);
      pincel.arc(largura * 0.42, -altura * 0.35, largura * 0.38, 0, Math.PI * 2);
      pincel.moveTo(0, -altura * 0.7);
      pincel.arc(0, -altura * 0.66, largura * 0.44, 0, Math.PI * 2);
      break;

    default:
      pincel.ellipse(0, 0, largura, altura, 0, 0, Math.PI * 2);
      break;
  }

  pincel.closePath();
}

function desenharSombraNoChao(pincel, largura, altura) {
  pincel.fillStyle = 'rgba(0,0,0,.16)';
  pincel.beginPath();
  pincel.ellipse(0, altura + 8, largura * 0.82, 7, 0, 0, Math.PI * 2);
  pincel.fill();
}

function desenharOrelhas(pincel, largura, altura, cores, tipo) {
  if (tipo === 'nenhuma') {
    return;
  }

  pincel.fillStyle = cores.sombra;
  pincel.strokeStyle = cores.contorno;
  pincel.lineWidth = 2.5;

  const lados = [-1, 1];

  for (const lado of lados) {
    pincel.beginPath();

    if (tipo === 'pontudas') {
      pincel.moveTo(lado * largura * 0.42, -altura * 0.72);
      pincel.lineTo(lado * largura * 0.66, -altura * 1.6);
      pincel.lineTo(lado * largura * 0.86, -altura * 0.5);
    } else if (tipo === 'caidas') {
      pincel.ellipse(
        lado * largura * 0.78, -altura * 0.2,
        largura * 0.2, altura * 0.46,
        lado * 0.5, 0, Math.PI * 2,
      );
    } else {
      // Antena: uma haste e uma bolinha. Só uma, no meio.
      if (lado === -1) {
        continue;
      }

      pincel.moveTo(0, -altura * 0.95);
      pincel.lineTo(0, -altura * 1.55);
      pincel.stroke();

      pincel.beginPath();
      pincel.arc(0, -altura * 1.62, largura * 0.13, 0, Math.PI * 2);
    }

    pincel.closePath();
    pincel.fill();
    pincel.stroke();
  }
}

// A barriga clara. É ela que faz o bicho parecer um bicho, e não uma bola.
function desenharBarriga(pincel, largura, altura, cores) {
  pincel.fillStyle = cores.barriga;
  pincel.beginPath();
  pincel.ellipse(0, altura * 0.3, largura * 0.52, altura * 0.46, 0, 0, Math.PI * 2);
  pincel.fill();
}

// O brilho no alto à esquerda, que sugere de onde vem a luz.
function desenharBrilho(pincel, largura, altura, cores) {
  pincel.fillStyle = cores.brilho;
  pincel.globalAlpha = 0.55;
  pincel.beginPath();
  pincel.ellipse(
    -largura * 0.38, -altura * 0.45,
    largura * 0.2, altura * 0.13,
    -0.5, 0, Math.PI * 2,
  );
  pincel.fill();
  pincel.globalAlpha = 1;
}

function desenharPes(pincel, largura, altura, cores) {
  pincel.fillStyle = cores.sombra;
  pincel.strokeStyle = cores.contorno;
  pincel.lineWidth = 2;

  for (const lado of [-1, 1]) {
    pincel.beginPath();
    pincel.ellipse(
      lado * largura * 0.42, altura * 0.92,
      largura * 0.26, altura * 0.16,
      0, 0, Math.PI * 2,
    );
    pincel.fill();
    pincel.stroke();
  }
}
