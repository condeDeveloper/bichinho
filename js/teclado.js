// Atalhos de teclado.
//
// As teclas saem da mesma lista `ACOES` dos botões, pelo mesmo motivo: uma
// fonte só. E há duas regras que separam um atalho útil de um atalho
// irritante, e as duas estão aqui.

function ligarTeclado(aoUsar, extras = {}) {
  window.addEventListener('keydown', (evento) => {
    // Primeira regra: não sequestrar a tecla quando a pessoa está escrevendo.
    // Um atalho de uma letra só que dispara dentro de um campo de texto é o
    // jeito mais rápido de estragar um formulário.
    const alvo = evento.target;

    if (alvo instanceof HTMLElement
        && (alvo.isContentEditable
            || ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName))) {
      return;
    }

    // Segunda regra: não roubar as combinações do navegador. Ctrl+1 troca de
    // aba, e um brinquedo não tem o direito de impedir isso.
    if (evento.ctrlKey || evento.metaKey || evento.altKey) {
      return;
    }

    const tecla = evento.key;

    for (const [chave, acao] of Object.entries(ACOES)) {
      if (tecla === acao.tecla) {
        evento.preventDefault();
        aoUsar(chave);

        return;
      }
    }

    const extra = extras[tecla.toLowerCase()];

    if (extra) {
      evento.preventDefault();
      extra();
    }
  });
}

// A lista de atalhos, para a legenda embaixo da tela.
function listarAtalhos(extras = {}) {
  const daAcoes = Object.values(ACOES).map((acao) => `${acao.tecla} ${acao.nome.toLowerCase()}`);
  const dosExtras = Object.entries(extras).map(([tecla, rotulo]) => `${tecla} ${rotulo}`);

  return [...daAcoes, ...dosExtras].join('  ·  ');
}
