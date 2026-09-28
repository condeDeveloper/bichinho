// O tempo, que passa mesmo com a aba fechada.
//
// Esta é a parte do brinquedo que tem alguma dificuldade de verdade, e é
// também a que define o que um bichinho virtual é. Se o tempo só corresse com
// a página aberta, cuidar dele não custaria nada: bastaria abrir, alimentar e
// fechar. O que dá peso ao brinquedo é justamente voltar no dia seguinte e
// encontrar o estrago.
//
// Então o tempo não é contado em quadros nem em `setInterval`. Ele é contado
// pelo relógio do sistema: o que fica guardado é o instante do último tique, e
// ao abrir a página o jogo calcula quantos minutos passaram e roda todos eles
// de uma vez.

const MINUTO = 60 * 1000;

// Quanto tempo de ausência o jogo simula, no máximo.
//
// Sem um teto, voltar depois de um mês faria o laço rodar 43 mil vezes. Com um
// teto pequeno demais, sumir por dois dias sairia barato. Três dias é o meio
// termo: é mais do que suficiente para matar um bichinho abandonado, e roda em
// alguns milissegundos.
const TETO_DE_AUSENCIA = 3 * 24 * 60;

function criarRelogio() {
  return {
    agora() {
      return Date.now();
    },

    // Quantos minutos inteiros separam dois instantes.
    minutosEntre(antes, depois) {
      return Math.floor((depois - antes) / MINUTO);
    },

    // Quanto do minuto corrente já passou, de 0 a 1 — para as animações.
    fracaoDoMinuto(instante) {
      return (instante % MINUTO) / MINUTO;
    },

    // Se é noite pelo relógio de quem está olhando. O bichinho dorme junto.
    ehNoite(instante) {
      const hora = new Date(instante).getHours();

      return hora >= 22 || hora < 7;
    },

    // Quantos minutos simular, e quantos foram perdidos pelo teto.
    planejarAusencia(ultimoTique, agora) {
      const passados = Math.max(0, this.minutosEntre(ultimoTique, agora));

      return {
        simular: Math.min(passados, TETO_DE_AUSENCIA),
        passados,
        cortados: Math.max(0, passados - TETO_DE_AUSENCIA),
      };
    },
  };
}

// "2 h 15 min", "3 dias", "agora mesmo" — para o relatório de ausência.
function emPalavras(minutos) {
  if (minutos < 1) {
    return 'agora mesmo';
  }

  if (minutos < 60) {
    return `${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  if (horas < 24) {
    return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
  }

  const dias = Math.floor(horas / 24);
  const sobra = horas % 24;

  if (sobra === 0) {
    return dias === 1 ? '1 dia' : `${dias} dias`;
  }

  return dias === 1 ? `1 dia e ${sobra} h` : `${dias} dias e ${sobra} h`;
}
