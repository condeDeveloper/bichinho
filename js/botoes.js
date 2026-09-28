// Os botões, montados a partir da lista de ações.
//
// Eles saem de `ACOES` e não do HTML: acrescentar uma ação nova é uma linha
// naquele objeto, e o botão aparece sozinho, com tecla de atalho e tudo. Ter a
// lista em dois lugares é o jeito mais fácil de os dois discordarem.

function criarBotoes(raiz, aoUsar) {
  const botoes = new Map();

  for (const [chave, acao] of Object.entries(ACOES)) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao';
    botao.dataset.acao = chave;

    const icone = document.createElement('span');
    icone.className = 'botao-icone';
    icone.textContent = acao.icone;
    icone.setAttribute('aria-hidden', 'true');

    const nome = document.createElement('span');
    nome.className = 'botao-nome';
    nome.textContent = acao.nome;

    const tecla = document.createElement('kbd');
    tecla.textContent = acao.tecla;

    botao.append(icone, nome, tecla);
    botao.setAttribute('aria-keyshortcuts', acao.tecla);

    botao.addEventListener('click', () => aoUsar(chave));

    raiz.append(botao);
    botoes.set(chave, botao);
  }

  return {
    // O empurrãozinho visual de quem apertou. Ele é reiniciado tirando e
    // repondo a classe — sem o reflow no meio, apertar duas vezes seguidas
    // não anima na segunda.
    piscar(chave) {
      const botao = botoes.get(chave);

      if (!botao) {
        return;
      }

      botao.classList.remove('apertado');
      void botao.offsetWidth;
      botao.classList.add('apertado');
    },

    // Desliga os botões quando não há mais o que fazer.
    travar(travado) {
      for (const botao of botoes.values()) {
        botao.disabled = travado;
      }
    },

    // Marca os que resolveriam a urgência do momento. É uma ajuda para quem
    // abriu o brinquedo agora e não sabe qual apertar.
    destacar(estado) {
      const urgente = estado.vivo ? maisUrgente(estado.necessidades) : null;

      const sugerido = {
        fome: 'alimentar',
        diversao: 'brincar',
        higiene: 'limpar',
        energia: 'luz',
      }[urgente];

      for (const [chave, botao] of botoes) {
        const remedio = chave === 'remediar' && estado.doente;

        botao.classList.toggle('sugerido', chave === sugerido || remedio);
      }
    },
  };
}
