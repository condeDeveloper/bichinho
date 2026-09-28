// As quatro barrinhas, e a velocidade com que elas caem.
//
// Todas vão de 0 a 100, e 100 é o bom. Chamar de "fome" uma barra que enche
// quando o bicho está satisfeito é confuso na hora de ler o código, mas é o
// que a interface mostra — e aqui a interface manda, porque é ela que a pessoa
// vê.
//
// Os números abaixo são a única coisa que decide se o brinquedo é chato ou
// aflitivo. Eles saíram de tentar: rápido demais e cuidar vira trabalho; lento
// demais e o bichinho não precisa de você.

const NECESSIDADES = ['fome', 'energia', 'diversao', 'higiene'];

// O rótulo da primeira não é "Fome", e a diferença importa: todas as barras
// aqui são cheias quando está tudo bem, e uma barra chamada "Fome" vazia lê
// como "sem fome" — o oposto do que ela quer dizer. "Barriga" vazia não tem
// como ser lida errado.
const NOMES = {
  fome: 'Barriga',
  energia: 'Energia',
  diversao: 'Diversão',
  higiene: 'Higiene',
};

// Quantos minutos cada barra leva para ir de 100 a 0, sem ninguém cuidar.
// Estes quatro números saíram de medir, e não de escolher. A ferramenta
// `ferramentas/balanco.mjs` roda o jogo inteiro em três cenários e imprime o
// tempo em horas — foi ela que mostrou que a primeira versão matava o
// bichinho em 57 minutos e era inganhável mesmo cuidando a cada 10.
const MINUTOS_PARA_ZERAR = {
  fome: 60,
  energia: 90,
  diversao: 45,
  higiene: 75,
};

// Abaixo disto o bichinho reclama; abaixo do crítico, a saúde começa a cair.
const LIMITE_DE_QUEIXA = 40;
const LIMITE_CRITICO = 15;

function criarNecessidades() {
  return { fome: 100, energia: 100, diversao: 100, higiene: 100 };
}

function quedaPorMinuto(qual) {
  return 100 / MINUTOS_PARA_ZERAR[qual];
}

// Toda barra deste jogo vive entre 0 e 100, e todo arquivo precisava
// prender o valor nessa faixa. A conta mora aqui, uma vez — três cópias da
// mesma linha em três arquivos é como uma delas acaba com `Math.min` e
// `Math.max` trocados.
function limitarBarra(valor) {
  return Math.max(0, Math.min(100, valor));
}

// Passa um minuto. `dormindo` muda o jogo inteiro: a energia sobe em vez de
// cair, e a fome cai mais devagar porque ele não está gastando nada.
function passarMinuto(necessidades, dormindo, sujeiras) {
  const proximas = { ...necessidades };

  if (dormindo) {
    proximas.energia = limitarBarra(proximas.energia + 100 / 25);
    proximas.fome = limitarBarra(proximas.fome - quedaPorMinuto('fome') * 0.4);
    proximas.diversao = limitarBarra(proximas.diversao - quedaPorMinuto('diversao') * 0.3);
  } else {
    proximas.energia = limitarBarra(proximas.energia - quedaPorMinuto('energia'));
    proximas.fome = limitarBarra(proximas.fome - quedaPorMinuto('fome'));
    proximas.diversao = limitarBarra(proximas.diversao - quedaPorMinuto('diversao'));
  }

  // Cada sujeira no chão acelera a queda da higiene. É o que faz limpar ser
  // uma tarefa de verdade e não um botão decorativo: deixar duas no chão
  // triplica a velocidade.
  const sujeira = 1 + sujeiras * 1;
  proximas.higiene = limitarBarra(proximas.higiene - quedaPorMinuto('higiene') * sujeira);

  return proximas;
}

function estaCritica(necessidades, qual) {
  return necessidades[qual] <= LIMITE_CRITICO;
}

function quantasCriticas(necessidades) {
  return NECESSIDADES.filter((qual) => estaCritica(necessidades, qual)).length;
}

// A necessidade mais urgente, ou null se está tudo bem. É o que vira a fala do
// bichinho e o destaque no painel.
function maisUrgente(necessidades) {
  let pior = null;

  for (const qual of NECESSIDADES) {
    if (necessidades[qual] > LIMITE_DE_QUEIXA) {
      continue;
    }

    if (pior === null || necessidades[qual] < necessidades[pior]) {
      pior = qual;
    }
  }

  return pior;
}

// A média, que é o que decide o humor.
function contentamento(necessidades) {
  const soma = NECESSIDADES.reduce((total, qual) => total + necessidades[qual], 0);

  return soma / NECESSIDADES.length;
}
