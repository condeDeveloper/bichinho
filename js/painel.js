// As barrinhas e os números — a única parte que não é canvas.
//
// Podiam ser desenhadas no canvas junto com o resto, e não são de propósito:
// como HTML, elas são lidas por leitor de tela, selecionáveis, e mudam de
// tamanho com a janela sem nenhuma conta. O canvas fica com o que é desenho, o
// HTML com o que é informação.

function criarPainel(raiz) {
  const barras = new Map();

  for (const qual of NECESSIDADES) {
    const linha = document.createElement('div');
    linha.className = 'barra';

    const nome = document.createElement('span');
    nome.className = 'barra-nome';
    nome.textContent = NOMES[qual];

    const trilho = document.createElement('div');
    trilho.className = 'barra-trilho';
    trilho.setAttribute('role', 'progressbar');
    trilho.setAttribute('aria-label', NOMES[qual]);
    trilho.setAttribute('aria-valuemin', '0');
    trilho.setAttribute('aria-valuemax', '100');

    const cheio = document.createElement('div');
    cheio.className = 'barra-cheio';

    trilho.append(cheio);
    linha.append(nome, trilho);
    raiz.append(linha);

    barras.set(qual, { linha, trilho, cheio });
  }

  return {
    atualizar(estado) {
      for (const qual of NECESSIDADES) {
        const { trilho, cheio, linha } = barras.get(qual);
        const valor = Math.round(estado.necessidades[qual]);

        cheio.style.width = `${valor}%`;
        cheio.style.background = corDaBarra(valor);
        trilho.setAttribute('aria-valuenow', String(valor));

        // A classe é que faz piscar, e ela entra só no crítico. Piscar a
        // partir de "meio baixo" transformaria o painel num alarme constante,
        // e um alarme constante é um alarme ignorado.
        linha.classList.toggle('critica', valor <= 15);
      }
    },
  };
}

// A linha de informações: nome, idade, estágio, saúde.
function criarFicha(raiz) {
  const nome = document.createElement('strong');
  nome.className = 'ficha-nome';

  const detalhe = document.createElement('span');
  detalhe.className = 'ficha-detalhe';

  const saude = document.createElement('span');
  saude.className = 'ficha-saude';

  raiz.append(nome, detalhe, saude);

  return {
    atualizar(estado) {
      const estagio = estagioPara(estado.minutosDeVida);

      nome.textContent = estado.personalidade.nome;
      detalhe.textContent = `${estagio.nome} · ${idadeEmPalavras(estado.minutosDeVida)}`;

      const descricao = descricaoDaSaude(estado.saude);
      saude.textContent = estado.doente ? `${descricao} · doente` : descricao;
      saude.style.color = corDaBarra(estado.saude);
    },
  };
}

// O rodapé com os contadores. Eles não servem para nada no jogo, e é por isso
// que estão aqui: é o que a pessoa mostra para alguém.
function criarPlacar(raiz) {
  const campos = [
    ['vezesAlimentado', 'refeições'],
    ['vezesQueBrincou', 'brincadeiras'],
    ['vezesQueLimpou', 'faxinas'],
    ['remediosDados', 'remédios'],
  ];

  const elementos = new Map();

  for (const [chave, rotulo] of campos) {
    const item = document.createElement('div');
    item.className = 'placar-item';

    const valor = document.createElement('b');
    valor.textContent = '0';

    const texto = document.createElement('span');
    texto.textContent = rotulo;

    item.append(valor, texto);
    raiz.append(item);

    elementos.set(chave, valor);
  }

  return {
    atualizar(estado) {
      for (const [chave, elemento] of elementos) {
        elemento.textContent = String(estado[chave] ?? 0);
      }
    },
  };
}
