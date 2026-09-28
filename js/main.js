// A partida: liga os pedaços e sai da frente.
//
// Este arquivo não decide regra nenhuma. Ele acha os elementos, monta os
// objetos, resolve o que aconteceu na ausência e entrega tudo ao laço. Se
// alguma regra do jogo acabar aqui, é sinal de que ela não achou o lugar dela.

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('tela');
  const som = criarSom();
  const tela = criarTela(canvas);

  const painel = criarPainel(document.getElementById('barras'));
  const ficha = criarFicha(document.getElementById('ficha'));
  const placar = criarPlacar(document.getElementById('placar'));
  const caixaDeRelatorio = document.getElementById('relatorio');

  // Os botões precisam chamar o jogo, e o jogo precisa mexer nos botões.
  //
  // A saída não é um intermediário: é declarar `jogo` com `let` antes e deixar
  // a função do clique fechar sobre a **variável**, e não sobre o valor. Quando
  // alguém clicar, `jogo` já vai estar preenchido — um clique não acontece
  // entre duas linhas do mesmo bloco.
  let jogo;

  const botoes = criarBotoes(
    document.getElementById('botoes'),
    (chave) => jogo.usar(chave),
  );

  jogo = criarJogo({
    tela,
    som,
    painel,
    ficha,
    placar,
    botoes,
    aoRelatar: (relatorio) => mostrarRelatorio(caixaDeRelatorio, relatorio),
  });

  const { estado, relatorio } = acordarBichinho();

  jogo.comecar(estado, relatorio);

  ligarTeclado((chave) => jogo.usar(chave), {
    r: () => recomecarComConfirmacao(jogo),
    m: () => alternarSom(som),
  });

  document.getElementById('atalhos').textContent = listarAtalhos({
    R: 'recomeçar',
    M: 'som',
  });

  document.getElementById('recomecar')
    .addEventListener('click', () => recomecarComConfirmacao(jogo));

  document.getElementById('somBotao')
    .addEventListener('click', () => alternarSom(som));

  // O primeiro toque em qualquer lugar destrava o áudio. Os navegadores exigem
  // um gesto, e o gesto que a pessoa dá primeiro raramente é no botão de som.
  window.addEventListener('pointerdown', () => som.acordar(), { once: true });
});

// Lê o bichinho guardado, roda a ausência e devolve o estado já em dia.
function acordarBichinho() {
  const guardado = recuperar();

  if (!guardado) {
    return { estado: nascer(), relatorio: null };
  }

  const relogio = criarRelogio();
  const agora = relogio.agora();
  const plano = relogio.planejarAusencia(guardado.ultimoTique, agora);

  if (plano.simular === 0) {
    return { estado: { ...guardado, ultimoTique: agora }, relatorio: null };
  }

  const { estado, eventos } = avancar(guardado, plano.simular, agora);

  guardar(estado);

  if (!valeContar(plano.passados)) {
    return { estado, relatorio: null };
  }

  return {
    estado,
    relatorio: montarRelatorio(guardado, estado, eventos, plano.passados),
  };
}

function mostrarRelatorio(caixa, relatorio) {
  if (!relatorio || relatorio.nada) {
    return;
  }

  caixa.textContent = '';

  const titulo = document.createElement('h2');
  titulo.textContent = relatorio.morreu
    ? `Você sumiu por ${relatorio.tempo}...`
    : `Enquanto você não estava (${relatorio.tempo})`;

  const lista = document.createElement('ul');

  for (const linha of relatorio.linhas) {
    const item = document.createElement('li');
    item.textContent = linha;
    lista.append(item);
  }

  const fechar = document.createElement('button');
  fechar.type = 'button';
  fechar.className = 'botao-fechar';
  fechar.textContent = 'ok';
  fechar.addEventListener('click', () => caixa.classList.remove('aberto'));

  caixa.append(titulo, lista, fechar);
  caixa.classList.add('aberto');

  fechar.focus();
}

function recomecarComConfirmacao(jogo) {
  const estado = jogo.estado;

  if (estado && estado.vivo) {
    const certeza = window.confirm(
      `${estado.personalidade.nome} ainda está vivo. Recomeçar mesmo assim?`,
    );

    if (!certeza) {
      return;
    }
  }

  jogo.recomecar();
}

function alternarSom(som) {
  const ligado = som.alternar();
  const botao = document.getElementById('somBotao');

  botao.textContent = ligado ? '🔊' : '🔇';
  botao.setAttribute('aria-label', ligado ? 'desligar o som' : 'ligar o som');
}
