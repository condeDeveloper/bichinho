// O laço principal: junta tudo e faz o tempo andar.
//
// Há dois relógios aqui, e eles são diferentes de propósito:
//
//   - o de **desenho** roda com `requestAnimationFrame`, sessenta vezes por
//     segundo, e só mexe em pixels;
//   - o de **vida** roda a cada minuto do relógio do sistema, e é o único que
//     muda o bichinho.
//
// Separar os dois é o que faz o brinquedo se comportar igual numa aba em
// primeiro plano e numa aba esquecida atrás — o navegador congela o
// `requestAnimationFrame` de abas escondidas, e se a vida dependesse dele o
// bichinho pararia de envelhecer sempre que alguém trocasse de aba.

function criarJogo({ canvas, tela, som, painel, ficha, placar, botoes, aoRelatar }) {
  const relogio = criarRelogio();
  let estado = null;
  let sorteioDeFala = criarSorteio(1);
  let proximaFala = 0;
  let ultimoChamado = 0;

  function comecar(inicial, relatorio) {
    estado = inicial;
    sorteioDeFala = criarSorteio(estado.personalidade.semente);

    desenharTudo();

    if (relatorio) {
      aoRelatar(relatorio);
    }

    requestAnimationFrame(quadro);
    setInterval(tique, 1000);
  }

  // Um segundo de relógio. A vida só anda quando um minuto inteiro fecha —
  // o resto do tempo isto aqui não faz nada, e é barato o bastante para rodar
  // a cada segundo em vez de tentar acertar o instante exato da virada.
  function tique() {
    if (!estado) {
      return;
    }

    const agora = relogio.agora();
    const minutos = relogio.minutosEntre(estado.ultimoTique, agora);

    if (minutos <= 0) {
      return;
    }

    const antes = estado;
    const { estado: depois, eventos } = avancar(estado, minutos, agora);

    estado = depois;

    reagirAosEventos(antes, eventos);
    guardar(estado);
    atualizarInterface();
  }

  function reagirAosEventos(antes, eventos) {
    for (const evento of eventos) {
      if (evento === 'morreu') {
        tocar(som, 'morrer');
        tela.falar('...', 6000);
        botoes.travar(true);
      } else if (evento.startsWith('virou ')) {
        tocar(som, 'evoluir');
        tela.falar(evento, 3200);
        tela.soltar('nota', 8);
      } else if (evento === 'adoeceu') {
        tela.soltar('raiva', 4);
      }
    }
  }

  // O quadro de desenho. Nada aqui muda o estado — se mudasse, minimizar a
  // janela alteraria o jogo.
  function quadro(instante) {
    if (estado) {
      tela.desenhar(estado, instante, relogio.ehNoite(relogio.agora()));
      talvezFalar(instante);
      talvezChamar(instante);
    }

    requestAnimationFrame(quadro);
  }

  // Ele fala sozinho de vez em quando. O intervalo é sorteado para que duas
  // falas seguidas não caiam no mesmo ritmo.
  function talvezFalar(instante) {
    if (instante < proximaFala || !estado.vivo || estaNoOvo(estado.minutosDeVida)) {
      return;
    }

    proximaFala = instante + 7000 + sorteioDeFala.fracao() * 9000;

    if (estado.dormindo) {
      return;
    }

    tela.falar(falaDe(estado, sorteioDeFala));
  }

  // O bipe de "preciso de você". Ele tem um intervalo mínimo longo de
  // propósito: um aviso que toca toda hora deixa de ser aviso.
  function talvezChamar(instante) {
    if (!estado.vivo || estado.dormindo || instante - ultimoChamado < 25000) {
      return;
    }

    if (quantasCriticas(estado.necessidades) === 0 && !estado.doente) {
      return;
    }

    ultimoChamado = instante;
    chamar(som);
  }

  function usar(chave) {
    if (!estado) {
      return;
    }

    const acao = ACOES[chave];

    if (!acao) {
      return;
    }

    som.acordar();
    botoes.piscar(chave);

    const resultado = acao.funcao(estado);

    if (!resultado.feito) {
      tela.falar(resultado.mensagem, 1800);
      tocar(som, 'recusa');

      return;
    }

    estado = resultado.estado;

    tela.falar(resultado.mensagem, 2200);
    tocar(som, resultado.som);
    soltarEfeito(chave, resultado.som);

    guardar(estado);
    atualizarInterface();
  }

  function soltarEfeito(chave, som) {
    if (som === 'ruim') {
      tela.soltar('raiva', 3);

      return;
    }

    const efeitos = {
      alimentar: ['migalha', 5],
      brincar: ['coracao', 6],
      limpar: ['bolha', 7],
      remediar: ['coracao', 3],
      luz: ['zzz', 2],
    };

    const efeito = efeitos[chave];

    if (efeito) {
      tela.soltar(efeito[0], efeito[1]);
    }
  }

  function atualizarInterface() {
    painel.atualizar(estado);
    ficha.atualizar(estado);
    placar.atualizar(estado);
    botoes.destacar(estado);
    botoes.travar(!estado.vivo);
  }

  function desenharTudo() {
    atualizarInterface();
  }

  return {
    comecar,
    usar,

    get estado() {
      return estado;
    },

    recomecar() {
      esquecer();

      estado = nascer();

      guardar(estado);
      tocar(som, 'nascer');
      tela.falar('oi!', 3000);
      tela.soltar('coracao', 6);

      botoes.travar(false);
      atualizarInterface();
    },
  };
}
