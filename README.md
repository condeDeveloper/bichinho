# bichinho

Um bichinho virtual em JavaScript puro — **sem framework, sem build, sem uma
dependência**, e sem um único arquivo de imagem ou de som.

**[Jogar](https://condedeveloper.github.io/bichinho/)**

Tudo o que aparece na tela é desenhado com `bezierCurveTo` e `arc`. Tudo o que
se ouve sai de um oscilador criado na hora. O repositório é só texto.

## O que faz dele um bichinho, e não uma tela

O tempo passa com a aba fechada.

Isso parece detalhe e é a coisa inteira. Se o relógio só andasse com a página
aberta, cuidar dele não custaria nada — bastava abrir, apertar os botões e
fechar. O que dá peso ao brinquedo é voltar no dia seguinte e encontrar o
estrago.

```
Enquanto você não estava (5 h)
  · virou adulto
  · fez 2 sujeiras
  · ficou doente
  · dormiu 3 vezes
```

Então o tempo não é contado em quadros nem em `setInterval`. O que fica
guardado é o instante do último minuto, e ao abrir a página o jogo calcula
quantos minutos passaram e roda todos eles de uma vez — respeitando o dia e a
noite de cada um, para que um bichinho que sumiu das 18h às 8h tenha dormido no
meio.

Há um teto de três dias na simulação. Sem ele, voltar depois de um mês faria o
laço rodar 43 mil vezes; com um teto menor, sumir por dois dias sairia barato.

## Dois relógios, e eles são diferentes de propósito

| | roda com | mexe em |
|---|---|---|
| **desenho** | `requestAnimationFrame`, 60×/s | pixels |
| **vida** | o relógio do sistema, 1×/min | o bichinho |

O navegador congela o `requestAnimationFrame` de abas escondidas. Se a vida
dependesse dele, o bichinho pararia de envelhecer sempre que alguém trocasse
de aba — e o brinquedo se comportaria diferente conforme a janela estivesse na
frente ou atrás.

## O balanço saiu de medir, não de escolher

Os números que decidem se o brinquedo é chato ou aflitivo não têm significado
nenhum olhando sozinhos. "1,2 de queda por minuto por necessidade crítica" não
quer dizer nada até virar "morre em vinte minutos".

Então há uma ferramenta que roda o jogo de verdade — os mesmos arquivos que o
navegador carrega — e imprime o resultado em horas:

```
$ node ferramentas/balanco.mjs

  Quanto cada barra demora:
    fome       reclama em     51 min   zera em 1 h 00 min
    energia    reclama em 1 h 17 min   zera em 1 h 30 min
    diversao   reclama em     38 min   zera em     45 min
    higiene    reclama em 1 h 04 min   zera em 1 h 15 min

  Abandonado, morre em 6 h 47 min.
    ^ dentro do alvo (entre 6 h e 30 h).

  Com alguém cuidando:
    a cada  10 min:  sobrevive 3 dias, saúde 100
    a cada  20 min:  sobrevive 3 dias, saúde 97
    a cada  40 min:  sobrevive 3 dias, saúde 94
    a cada  60 min:  sobrevive 3 dias, saúde 62
    a cada 120 min:  morre em 53 h 57 min
```

A primeira versão, com números escolhidos no olho, matava o bichinho em **57
minutos** — e era **inganhável**: mesmo cuidando a cada dez minutos ele morria
em três horas e meia. Isso não aparece lendo o código. Apareceu na primeira vez
que a ferramenta rodou.

## Nenhum arquivo de imagem

O bichinho é feito de curvas, e a personalidade inteira sai de **um número**.

A semente é guardada junto com o resto, e dela saem o nome, o formato do corpo
(quatro), as orelhas (quatro), o matiz, a comida favorita e uma mania. Isso
resolve dois problemas de uma vez: não há nada binário no repositório, e o
mesmo bichinho acorda igual a como dormiu — com `Math.random()`, cada F5 daria
um bicho diferente com o mesmo nome.

E um corpo desenhado por conta aceita ser esticado, inclinado e recolorido em
tempo de execução. Ele infla quando come, agacha quando dorme e perde a cor
quando adoece. Com imagem, seriam dezenas de arquivos.

O rosto é um arquivo separado do corpo porque são dois eixos independentes: o
corpo muda por personalidade, o rosto muda por humor. Juntos dariam dezesseis
funções em vez de duas — e é impressionante o quão pouco basta para a
expressão. Dois pontos e uma curva. Um arco para baixo é alegria, para cima é
tristeza, uma linha reta é tédio.

## Nenhum arquivo de som

Todo o áudio sai de osciladores da Web Audio API: uma onda quadrada, um
envelope e pronto. A onda quadrada é escolha estética — é o som de console
portátil de 1997, que é exatamente o que um bichinho virtual devia soar.

As musiquinhas seguem uma gramática que o ouvido entende sem ninguém explicar:
**subindo é coisa boa, descendo é coisa ruim, repetido é aviso**. É a mesma
convenção de todo aparelho eletrônico desde o forno de micro-ondas.

O envelope não é enfeite. Sem ele, ligar e desligar o oscilador produz um
estalo: a onda corta no meio de um ciclo e o alto-falante ouve um degrau.

## A armadilha que custou mais tempo

O `index.html` carrega vinte e quatro `<script>` comuns, sem módulos, para que
o arquivo abra com duplo clique. O preço é que **todos dividem o mesmo escopo
global**, e dois `const` com o mesmo nome em arquivos diferentes derrubam o
segundo inteiro.

Aconteceu: `necessidades.js` tinha um `NOMES` e `personalidade.js` também. O
sintoma foi `sortearPersonalidade is not defined`, num terceiro arquivo, e levou
um tempo até ficar claro que não era ordem de carregamento.

A conferência virou uma ferramenta de trinta linhas:

```
$ node ferramentas/conferir-colisoes.mjs

  24 arquivos, 129 nomes no escopo global

  nenhuma colisão
```

Um módulo ES resolveria isso de graça. Esta é a conta de não usar um — e ela
roda na CI.

## As decisões de jogo que têm motivo

**Comer sem fome empanturra.** É a única ação que pode piorar as coisas, e ela
existe para que "apertar tudo o tempo todo" não seja a melhor estratégia.

**Remédio sem doença faz mal**, como remédio de verdade.

**Apagar a luz não força o sono** — ele dorme se estiver com sono. Forçar seria
tirar a única coisa que o bichinho decide sozinho.

**Cada sujeira no chão acelera a queda da higiene.** É o que faz limpar ser uma
tarefa e não um botão decorativo: deixar duas no chão triplica a velocidade.

**A saúde é a única barra que você não controla.** Ela é consequência das
outras quatro. Um botão de "curar" tiraria o sentido delas.

**O humor tem histerese.** O limite para entrar num estado é diferente do
limite para sair — sem isso, um bichinho com a barra oscilando em volta do
limite troca de cara dez vezes por segundo. É o mesmo truque do termostato.

**A barra se chama "Barriga", e não "Fome".** Todas as barras aqui são cheias
quando está tudo bem, e uma barra chamada "Fome" vazia lê como "sem fome" — o
oposto do que ela quer dizer.

## O ovo

Os dois primeiros minutos são um ovo que treme, e nada acontece. Eles existem
para dar à pessoa um instante em que ela não pode fazer nada de errado.

As manchinhas do ovo já saem do matiz do bichinho lá dentro — é uma pista da
cor que vai nascer.

## Rodando

Abra o `index.html`. É só isso.

```bash
node ferramentas/balanco.mjs            # o balanço, em horas
node ferramentas/conferir-colisoes.mjs  # os nomes no escopo global
```

Atalhos: `1` alimentar, `2` brincar, `3` limpar, `4` remédio, `5` luz,
`R` recomeçar, `M` som.

## Estrutura

```
js/aleatorio.js       sorteio com semente -- o mesmo bicho, sempre
js/relogio.js         o tempo que passa com a aba fechada
js/necessidades.js    as quatro barras e a velocidade de cada uma
js/humor.js           a maquina de estados, com histerese
js/saude.js           doenca, morte e a sujeira que aparece sozinha
js/idade.js           os seis estagios de vida
js/personalidade.js   tudo o que sai da semente
js/bichinho.js        o estado inteiro, e o minuto que passa
js/acoes.js           alimentar, brincar, limpar, remediar, luz
js/persistencia.js    localStorage, com versao e migracao
js/relatorio.js       "enquanto voce nao estava..."
js/paleta.js          as cores, derivadas de um matiz
js/desenho/           cenario, corpo, rosto, particulas, tela
js/som/               oscilador e musiquinhas
js/painel.js          barras, ficha e placar -- em HTML, nao em canvas
js/botoes.js          montados a partir da lista de acoes
js/teclado.js         atalhos, com as duas regras que importam
js/jogo.js            os dois relogios
js/main.js            liga os pedacos e sai da frente
```

O painel é HTML e não canvas de propósito: assim ele é lido por leitor de tela,
é selecionável e muda de tamanho com a janela sem nenhuma conta. O canvas fica
com o que é desenho; o HTML, com o que é informação.

## Limites conhecidos

- **Um bichinho por navegador.** O `localStorage` guarda um só, e recomeçar
  apaga o anterior. Um cemitério seria uma boa ideia e é outro projeto.
- **Sem sincronizar entre aparelhos.** O bichinho do celular e o do computador
  são dois bichinhos.
- **Duas abas abertas brigam.** Cada uma guarda por cima da outra, e a última a
  escrever ganha. O `storage` event resolveria, e daria um bichinho que reage
  numa aba ao que aconteceu na outra.
- **O relógio é o da máquina.** Adiantar o relógio do sistema adianta o
  bichinho. Não há como resolver isso sem um servidor, e um servidor seria um
  projeto inteiro para um brinquedo que cabe num arquivo.
- **Sem toque prolongado nem arrastar.** Só cliques e teclas.
- **Sem jogo dentro do jogo.** "Brincar" é um botão, e nos aparelhos de verdade
  era um jogo de adivinhar direção. Seria a próxima coisa a acrescentar.

## Onde ele se encaixa

É o vigésimo primeiro projeto em JavaScript puro da coleção, e faz par com os
dezesseis jogos em [condedeveloper.github.io](https://condedeveloper.github.io/) —
todos sem framework, sem build e sem dependência.

## Licença

MIT.
