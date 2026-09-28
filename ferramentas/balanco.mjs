// Mede o balanço do jogo, em vez de chutar.
//
//   node ferramentas/balanco.mjs
//
// Os números de `necessidades.js` e `saude.js` decidem sozinhos se o brinquedo
// é chato ou aflitivo, e olhar para eles não diz nada: "1,2 de queda por
// minuto por necessidade crítica" não tem significado até virar "morre em
// vinte minutos".
//
// Então esta ferramenta roda o jogo de verdade — os mesmos arquivos que o
// navegador carrega — em três cenários, e imprime o tempo em horas. Foi ela
// que mostrou que a primeira versão matava o bichinho numa tarde.

import { readFileSync } from 'node:fs';

// Os arquivos do jogo são scripts clássicos, feitos para o navegador. Para
// rodá-los aqui, basta concatená-los e avaliar — é exatamente o que a tag
// `<script>` faz, e sem um empacotador no meio.
const ARQUIVOS = [
  'js/aleatorio.js',
  'js/relogio.js',
  'js/necessidades.js',
  'js/humor.js',
  'js/saude.js',
  'js/idade.js',
  'js/personalidade.js',
  'js/bichinho.js',
  'js/acoes.js',
];

const codigo = ARQUIVOS.map((caminho) => readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8')).join('\n');

const jogo = new Function(`${codigo}
  return {
    nascer, avancar, alimentar, brincar, limpar, remediar,
    MINUTOS_PARA_ZERAR, quantasCriticas,
  };
`)();

const MINUTO = 60 * 1000;

function emHoras(minutos) {
  if (minutos === Infinity) {
    return 'nunca';
  }

  const horas = Math.floor(minutos / 60);
  const resto = Math.round(minutos % 60);

  return horas === 0 ? `${resto} min` : `${horas} h ${String(resto).padStart(2, '0')} min`;
}

// Cenário 1: ninguém cuida. Quanto tempo até morrer?
function abandono() {
  let estado = jogo.nascer(1, Date.now());
  estado.minutosDeVida = 200;

  for (let minuto = 0; minuto < 60 * 24 * 7; minuto++) {
    const passo = jogo.avancar(estado, 1, Date.now() + minuto * MINUTO);
    estado = passo.estado;

    if (!estado.vivo) {
      return minuto;
    }
  }

  return Infinity;
}

// Cenário 2: alguém cuida a cada N minutos, apertando o que for preciso.
function cuidadoACada(intervalo) {
  let estado = jogo.nascer(2, Date.now());
  estado.minutosDeVida = 200;

  for (let minuto = 0; minuto < 60 * 24 * 3; minuto++) {
    const passo = jogo.avancar(estado, 1, Date.now() + minuto * MINUTO);
    estado = passo.estado;

    if (!estado.vivo) {
      return { morreu: minuto, saude: 0 };
    }

    if (minuto % intervalo !== 0) {
      continue;
    }

    for (const acao of [jogo.alimentar, jogo.brincar, jogo.limpar]) {
      const resultado = acao(estado);

      if (resultado.feito) {
        estado = resultado.estado;
      }
    }

    if (estado.doente) {
      const resultado = jogo.remediar(estado);

      if (resultado.feito) {
        estado = resultado.estado;
      }
    }
  }

  return { morreu: null, saude: Math.round(estado.saude) };
}

// Cenário 3: quanto tempo cada barra leva para chegar ao crítico.
function quandoReclama() {
  const linhas = [];

  for (const [qual, minutos] of Object.entries(jogo.MINUTOS_PARA_ZERAR)) {
    // Crítico é 15 de 100, então 85% do caminho.
    linhas.push([qual, minutos * 0.85, minutos]);
  }

  return linhas;
}

console.log('\n  Balanço do bichinho');
console.log('  ' + '-'.repeat(52));
console.log();

console.log('  Quanto cada barra demora:');

for (const [qual, ateCritico, ateZero] of quandoReclama()) {
  console.log(`    ${qual.padEnd(10)} reclama em ${emHoras(ateCritico).padStart(10)}`
    + `   zera em ${emHoras(ateZero).padStart(10)}`);
}

console.log();

const morte = abandono();
console.log(`  Abandonado, morre em ${emHoras(morte)}.`);

if (morte < 60 * 6) {
  console.log('    ^ cedo demais: não dá para sair para trabalhar.');
} else if (morte > 60 * 30) {
  console.log('    ^ tarde demais: abandonar não tem consequência.');
} else {
  console.log('    ^ dentro do alvo (entre 6 h e 30 h).');
}

console.log();
console.log('  Com alguém cuidando:');

for (const intervalo of [10, 20, 40, 60, 120]) {
  const resultado = cuidadoACada(intervalo);
  const situacao = resultado.morreu === null
    ? `sobrevive 3 dias, saúde ${resultado.saude}`
    : `morre em ${emHoras(resultado.morreu)}`;

  console.log(`    a cada ${String(intervalo).padStart(3)} min:  ${situacao}`);
}

console.log();
