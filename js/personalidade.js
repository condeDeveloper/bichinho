// Cada bichinho é um bichinho diferente, e tudo sai da semente.
//
// Nada aqui é decidido na hora: dada a semente, a personalidade inteira é a
// mesma para sempre, em qualquer navegador. É o que permite guardar dois bytes
// no armazenamento em vez de um retrato.

const CORPOS = ['redondo', 'gotinha', 'quadradinho', 'nuvem'];
const ORELHAS = ['pontudas', 'caidas', 'antena', 'nenhuma'];

const MATIZES = [
  { nome: 'menta', h: 158 },
  { nome: 'lilás', h: 268 },
  { nome: 'pêssego', h: 22 },
  { nome: 'céu', h: 205 },
  { nome: 'limão', h: 78 },
  { nome: 'rosa', h: 336 },
];

const COMIDAS = ['pizza', 'bolo', 'maçã', 'sorvete', 'pastel', 'brigadeiro'];

// Uma mania cada. Ela não muda o jogo — muda o que a pessoa conta para os
// outros sobre o próprio bichinho, que é o ponto.
const MANIAS = [
  'gira quando está feliz',
  'espirra quando está sujo',
  'olha para os lados o tempo todo',
  'pula quando ouve um som',
  'dorme de olho aberto',
  'infla quando come',
];

// Os nomes possíveis. O prefixo no nome da constante não é enfeite:
// `necessidades.js` também tem um `NOMES`, e em script clássico dois
// `const` iguais no escopo global derrubam o segundo arquivo inteiro,
// com um erro que aponta para o arquivo errado.
const NOMES_DE_BICHO = [
  'Tico', 'Pingo', 'Nuvem', 'Bolha', 'Zezé', 'Muffin', 'Pipoca', 'Amendoim',
  'Farofa', 'Tofu', 'Gude', 'Quindim', 'Biju', 'Pudim', 'Lasanha', 'Cuscuz',
];

function sortearPersonalidade(semente) {
  const sorteio = criarSorteio(semente);
  const matiz = sorteio.entre(MATIZES);

  return {
    semente,
    nome: sorteio.entre(NOMES_DE_BICHO),
    corpo: sorteio.entre(CORPOS),
    orelhas: sorteio.entre(ORELHAS),
    matiz: matiz.h,
    corNome: matiz.nome,
    comida: sorteio.entre(COMIDAS),
    mania: sorteio.entre(MANIAS),

    // Dois números que temperam o desenho: o quanto ele balança e o quanto os
    // olhos ficam separados. Pequenos, e é o que faz dois bichos da mesma cor
    // não parecerem gêmeos.
    balanco: 0.6 + sorteio.fracao() * 0.8,
    olhos: 0.8 + sorteio.fracao() * 0.5,
  };
}

function descreverPersonalidade(personalidade) {
  return `${personalidade.nome} é ${personalidade.corNome}, `
    + `gosta de ${personalidade.comida} e ${personalidade.mania}.`;
}
