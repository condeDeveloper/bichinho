// A saúde, a doença e a morte.
//
// A saúde é a única barra que a pessoa não controla direto. Ela é consequência:
// cai quando as outras ficam em zero, sobe sozinha quando está tudo em ordem.
// Um botão de "curar" tiraria o sentido das outras quatro.

// Quanto a saúde cai por minuto, para cada necessidade zerada.
//
// Este é o número mais sensível do jogo inteiro, e o mais fácil de errar: ele
// não tem significado nenhum olhando sozinho. Com 1,2 — o primeiro palpite —
// o bichinho morria em 57 minutos e não havia como salvá-lo nem cuidando a
// cada dez. Com 0,055, abandonado ele dura umas nove horas, que é o que separa
// "esqueci no almoço" de "esqueci a noite inteira".
const QUEDA_POR_CRITICA = 0.055;

// Quanto ela sobe por minuto quando nada está crítico e ele não está doente.
// Mais devagar do que cai: um descuido custa mais do que um cuidado rende, e é
// isso que faz cuidar valer a pena.
const RECUPERACAO = 0.35;

// Chance por minuto de adoecer, com tudo em ordem e com tudo em ruínas.
const CHANCE_BASE = 0.0008;
const CHANCE_POR_CRITICA = 0.004;

// Doente, a saúde cai mesmo com as necessidades cheias. É o que obriga a usar
// o remédio em vez de esperar passar — mas devagar, para dar tempo de notar:
// sozinha, a doença leva umas catorze horas para matar.
const QUEDA_POR_DOENCA = 0.12;

// Um minuto de saúde. Devolve o estado novo e o que aconteceu, para o
// relatório de ausência poder contar a história depois.
function passarMinutoDeSaude(estado, sorteio) {
  const criticas = quantasCriticas(estado.necessidades);
  let saude = estado.saude;
  let doente = estado.doente;
  const eventos = [];

  if (doente) {
    saude -= QUEDA_POR_DOENCA;
  }

  if (criticas > 0) {
    saude -= QUEDA_POR_CRITICA * criticas;
  } else if (!doente) {
    saude += RECUPERACAO;
  }

  if (!doente) {
    const chance = CHANCE_BASE + CHANCE_POR_CRITICA * criticas;

    if (sorteio.chance(chance)) {
      doente = true;
      eventos.push('adoeceu');
    }
  }

  saude = limitarBarra(saude);

  const vivo = saude > 0;

  if (estado.vivo && !vivo) {
    eventos.push('morreu');
  }

  return { saude, doente, vivo: estado.vivo && vivo, eventos };
}

// A sujeira aparece sozinha, e é o único evento que acontece **porque** o
// bichinho está bem: um bicho que come, suja.
const MINUTOS_ENTRE_SUJEIRAS = 18;
const MAXIMO_DE_SUJEIRAS = 4;

function talvezSujar(estado, sorteio) {
  if (estado.sujeiras >= MAXIMO_DE_SUJEIRAS || !estado.vivo || estado.dormindo) {
    return estado.sujeiras;
  }

  // Quanto mais alimentado, mais chance. A conta é boba de propósito: ela
  // existe para que alimentar tenha um preço, e não para simular digestão.
  const chance = (1 / MINUTOS_ENTRE_SUJEIRAS) * (estado.necessidades.fome / 100);

  return sorteio.chance(chance) ? estado.sujeiras + 1 : estado.sujeiras;
}

function descricaoDaSaude(saude) {
  if (saude >= 80) return 'saudável';
  if (saude >= 50) return 'meio abatido';
  if (saude >= 25) return 'fraco';
  if (saude > 0) return 'muito mal';

  return 'morreu';
}
