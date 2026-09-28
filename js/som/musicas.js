// As musiquinhas. Três notas cada, e é o bastante.
//
// Cada evento do jogo tem um som, e eles seguem uma gramática simples que o
// ouvido entende sem ninguém explicar: subindo é coisa boa, descendo é coisa
// ruim, repetido é aviso. É a mesma convenção de todo aparelho eletrônico
// desde o forno de micro-ondas.

const MUSICAS = {
  // Sobe: deu certo.
  comer: [['do', 0.09], ['mi', 0.09], ['sol', 0.14]],
  brincar: [['sol', 0.08], ['la', 0.08], ['si', 0.08], ['do', 0.16]],
  limpar: [['si', 0.07], ['re', 0.07], ['sol', 0.13]],
  remedio: [['mi', 0.1], ['sol', 0.1], ['do', 0.18]],

  // Desce: deu errado.
  ruim: [['sol', 0.1], ['re', 0.1], ['do', 0.2]],
  recusa: [['re', 0.07], ['do', 0.12]],

  // Noite e manhã.
  dormir: [['sol', 0.14], ['mi', 0.14], ['do', 0.3]],
  acordar: [['do', 0.09], ['sol', 0.09], ['do', 0.2]],

  // Os dois momentos grandes.
  nascer: [
    ['do', 0.1], ['mi', 0.1], ['sol', 0.1], ['do', 0.1],
    ['mi', 0.1], ['sol', 0.1], ['do', 0.32],
  ],
  evoluir: [
    ['sol', 0.08], ['la', 0.08], ['si', 0.08], ['do', 0.08],
    ['re', 0.08], ['mi', 0.24],
  ],

  // A morte. Descendo devagar, e em oitava grave.
  morrer: [['do', 0.3], ['si', 0.3], ['sol', 0.4], ['mi', 0.8]],
};

// A oitava de cada uma. Grave para o que é ruim.
const OITAVAS = {
  morrer: -2,
  ruim: -1,
  recusa: -1,
  dormir: -1,
  nascer: 1,
  evoluir: 1,
};

function tocar(som, qual) {
  const musica = MUSICAS[qual];

  if (!musica) {
    return;
  }

  som.melodia(musica, OITAVAS[qual] ?? 0, qual === 'morrer' ? 0.06 : 0.08);
}

// O barulho de fundo do bichinho chamando. Não é música: é um bipe duplo, o
// mesmo dos aparelhos de verdade, e ele para de tocar depois de umas vezes
// para não virar tortura.
function chamar(som) {
  som.plim(880, 1320, 0.09);

  setTimeout(() => som.plim(880, 1320, 0.09), 150);
}
