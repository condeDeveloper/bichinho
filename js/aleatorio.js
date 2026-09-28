// Sorteio com semente — para que o mesmo bichinho seja sempre o mesmo.
//
// O `Math.random()` do navegador não aceita semente e não promete nada entre
// recarregamentos. Isso é um problema aqui por um motivo específico: a
// aparência e a personalidade do bichinho saem de sorteios, e ele precisa
// acordar igual a como dormiu. Com `Math.random()`, cada F5 daria um bicho
// diferente com o mesmo nome.
//
// Então a semente é guardada junto com o resto, e tudo o que descreve o
// bichinho é derivado dela. O que continua usando `Math.random()` é só o que
// pode mudar de verdade a cada instante: a hora de piscar, para onde ele anda.

// mulberry32 — trinta e duas linhas de aritmética que passam nos testes de
// aleatoriedade que importam para um brinquedo. Não serve para criptografia, e
// aqui ninguém pediu isso.
function criarSorteio(semente) {
  let estado = semente >>> 0;

  function proximo() {
    estado = (estado + 0x6d2b79f5) >>> 0;

    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    // Um número entre 0 e 1.
    fracao: proximo,

    // Um inteiro de `de` até `ate`, incluindo os dois.
    inteiro(de, ate) {
      return de + Math.floor(proximo() * (ate - de + 1));
    },

    // Um item de uma lista.
    entre(lista) {
      return lista[Math.floor(proximo() * lista.length)];
    },

    // Verdadeiro com a chance dada, de 0 a 1.
    chance(probabilidade) {
      return proximo() < probabilidade;
    },
  };
}

// Uma semente nova, do relógio e de um sorteio — só usada quando nasce um
// bichinho. Depois disso ela é guardada e nunca mais muda.
function semearAgora() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
