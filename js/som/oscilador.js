// Som sem arquivo de som.
//
// Todo o áudio deste brinquedo sai de osciladores da Web Audio API: uma onda
// quadrada, um envelope e pronto. O repositório não tem um único `.wav`, e o
// motivo não é economia de bytes — é que uma nota sintetizada aceita ser
// transposta, encurtada e encadeada em tempo de execução, e um arquivo não.
//
// A onda quadrada é escolha estética: é o som de console portátil de 1997, que
// é exatamente o que um bichinho virtual devia soar.

const NOTAS = {
  do: 261.63, dos: 277.18, re: 293.66, res: 311.13, mi: 329.63,
  fa: 349.23, fas: 369.99, sol: 392.0, sols: 415.3, la: 440.0,
  las: 466.16, si: 493.88,
};

function criarSom() {
  let contexto = null;
  let ligado = true;

  // O contexto só nasce no primeiro toque. Os navegadores bloqueiam áudio que
  // começa sozinho, e criar o contexto antes de um gesto do usuário deixa ele
  // suspenso para sempre — o som simplesmente nunca sai, sem erro nenhum.
  function garantirContexto() {
    if (!contexto) {
      const Classe = window.AudioContext || window.webkitAudioContext;

      if (!Classe) {
        return null;
      }

      contexto = new Classe();
    }

    if (contexto.state === 'suspended') {
      contexto.resume();
    }

    return contexto;
  }

  function nota(frequencia, inicio, duracao, volume = 0.08, forma = 'square') {
    const ctx = garantirContexto();

    if (!ctx || !ligado) {
      return;
    }

    const oscilador = ctx.createOscillator();
    const ganho = ctx.createGain();

    oscilador.type = forma;
    oscilador.frequency.value = frequencia;

    // O envelope. Sem ele, ligar e desligar o oscilador produz um estalo — a
    // onda corta no meio de um ciclo, e o alto-falante ouve um degrau.
    const t = ctx.currentTime + inicio;

    ganho.gain.setValueAtTime(0, t);
    ganho.gain.linearRampToValueAtTime(volume, t + 0.012);
    ganho.gain.setValueAtTime(volume, t + duracao - 0.03);
    ganho.gain.linearRampToValueAtTime(0, t + duracao);

    oscilador.connect(ganho);
    ganho.connect(ctx.destination);

    oscilador.start(t);
    oscilador.stop(t + duracao + 0.02);
  }

  return {
    nota,

    // Uma sequência de `[nome da nota, duração]`, tocada em fila.
    melodia(sequencia, oitava = 0, volume = 0.08) {
      let quando = 0;

      for (const [nome, duracao] of sequencia) {
        if (nome !== 'pausa') {
          nota(NOTAS[nome] * Math.pow(2, oitava), quando, duracao, volume);
        }

        quando += duracao;
      }
    },

    // Um ruído curto, para "plim" de botão. Frequência que desliza.
    plim(deFrequencia, paraFrequencia, duracao = 0.12) {
      const ctx = garantirContexto();

      if (!ctx || !ligado) {
        return;
      }

      const oscilador = ctx.createOscillator();
      const ganho = ctx.createGain();

      oscilador.type = 'square';

      const t = ctx.currentTime;

      oscilador.frequency.setValueAtTime(deFrequencia, t);
      oscilador.frequency.exponentialRampToValueAtTime(paraFrequencia, t + duracao);

      ganho.gain.setValueAtTime(0.06, t);
      ganho.gain.exponentialRampToValueAtTime(0.001, t + duracao);

      oscilador.connect(ganho);
      ganho.connect(ctx.destination);

      oscilador.start(t);
      oscilador.stop(t + duracao);
    },

    alternar() {
      ligado = !ligado;

      return ligado;
    },

    get ligado() {
      return ligado;
    },

    // Chamado no primeiro clique da página, para destravar o áudio.
    acordar() {
      garantirContexto();
    },
  };
}
