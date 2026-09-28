// Procura nomes declarados em mais de um arquivo.
//
//   node ferramentas/conferir-colisoes.mjs
//
// Este projeto usa `<script>` comum, sem módulos, para que o `index.html` abra
// com duplo clique. O preço é que **todos os arquivos dividem o mesmo escopo
// global** — e dois `const` com o mesmo nome em arquivos diferentes derrubam o
// segundo inteiro, com um `SyntaxError` que aponta para o arquivo certo e uma
// mensagem que não ajuda em nada depois.
//
// Foi exatamente o que aconteceu aqui: `necessidades.js` tinha um `NOMES` e
// `personalidade.js` também. O sintoma foi `sortearPersonalidade is not
// defined`, num terceiro arquivo, e levou um tempo até ficar claro que o
// problema não era ordem de carregamento.
//
// Um módulo ES resolveria isso de graça. Esta conferência é o preço de não
// usar um — e, sendo trinta linhas, é um preço baixo.

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PASTA = join(RAIZ, 'js');

// `const`, `let`, `var`, `function` e `class` no começo da linha, sem recuo —
// que é o que caracteriza uma declaração de nível superior neste projeto.
const DECLARACAO = /^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/;

async function listarArquivos(pasta) {
  const encontrados = [];

  for (const item of await readdir(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, item.name);

    if (item.isDirectory()) {
      encontrados.push(...await listarArquivos(caminho));
    } else if (item.name.endsWith('.js')) {
      encontrados.push(caminho);
    }
  }

  return encontrados.sort();
}

const arquivos = await listarArquivos(PASTA);
const declaracoes = new Map();

for (const caminho of arquivos) {
  const curto = relative(RAIZ, caminho).replaceAll('\\', '/');
  const conteudo = await readFile(caminho, 'utf8');

  for (const linha of conteudo.split('\n')) {
    const achado = DECLARACAO.exec(linha);

    if (!achado) {
      continue;
    }

    const nome = achado[1];

    if (!declaracoes.has(nome)) {
      declaracoes.set(nome, new Set());
    }

    declaracoes.get(nome).add(curto);
  }
}

const colisoes = [...declaracoes.entries()]
  .filter(([, arquivos]) => arquivos.size > 1)
  .sort(([a], [b]) => a.localeCompare(b));

console.log(`\n  ${arquivos.length} arquivos, ${declaracoes.size} nomes no escopo global\n`);

if (colisoes.length === 0) {
  console.log('  nenhuma colisão\n');
  process.exit(0);
}

console.log(`  ${colisoes.length} nome(s) declarado(s) em mais de um arquivo:\n`);

for (const [nome, onde] of colisoes) {
  console.log(`    ${nome.padEnd(26)} ${[...onde].sort().join(', ')}`);
}

console.log('\n  Em script clássico isso derruba o segundo arquivo inteiro.\n');
process.exit(1);
