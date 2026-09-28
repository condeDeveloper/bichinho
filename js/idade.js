// Os estágios de vida, contados em minutos de vida — não de tela.
//
// Como o tempo corre com a aba fechada, um bichinho deixado de lado por uma
// noite acorda mais velho. É a única forma que faz sentido: se a idade
// dependesse do tempo de tela, quem fechasse a aba teria um filhote eterno.

const ESTAGIOS = [
  { chave: 'ovo', nome: 'ovo', ate: 2, tamanho: 0.7 },
  { chave: 'filhote', nome: 'filhote', ate: 45, tamanho: 0.78 },
  { chave: 'crianca', nome: 'criança', ate: 180, tamanho: 0.9 },
  { chave: 'jovem', nome: 'jovem', ate: 600, tamanho: 1.0 },
  { chave: 'adulto', nome: 'adulto', ate: 2880, tamanho: 1.08 },
  { chave: 'idoso', nome: 'idoso', ate: Infinity, tamanho: 1.03 },
];

function estagioPara(minutosDeVida) {
  for (const estagio of ESTAGIOS) {
    if (minutosDeVida < estagio.ate) {
      return estagio;
    }
  }

  return ESTAGIOS[ESTAGIOS.length - 1];
}

// Se ele passou de estágio neste minuto. Serve para o relatório e para a
// musiquinha de evolução.
function evoluiu(minutosAntes, minutosDepois) {
  return estagioPara(minutosAntes).chave !== estagioPara(minutosDepois).chave;
}

// A idade em palavras, para o painel.
function idadeEmPalavras(minutos) {
  if (minutos < 60) {
    return `${Math.floor(minutos)} min de vida`;
  }

  const horas = Math.floor(minutos / 60);

  if (horas < 24) {
    return horas === 1 ? '1 hora de vida' : `${horas} horas de vida`;
  }

  const dias = Math.floor(horas / 24);

  return dias === 1 ? '1 dia de vida' : `${dias} dias de vida`;
}

// O ovo não faz nada e não precisa de nada. São dois minutos de espera antes
// de o brinquedo começar, e eles existem por um motivo: dar à pessoa um
// instante em que ela não pode fazer nada de errado.
function estaNoOvo(minutosDeVida) {
  return minutosDeVida < ESTAGIOS[0].ate;
}
