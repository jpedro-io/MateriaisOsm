# Site de materiais — Workspace Integrado

Página única, estática, com a identidade do site de inscrição. Sem formulário, sem API e sem banco de dados.

## Estrutura

```
index.html                          página única com as seções ancoradas
styles.css                          tokens, layout, cartões, botões e breakpoints (900 px e 560 px)
app.js                              entrada em sequência, cabeçalho reativo, barra de leitura, brilho do ponteiro, seção atual e avisos
vercel.json                         cabeçalhos de segurança (CSP, nosniff, Referrer-Policy, Permissions-Policy)
assets/card-divulgacao.jpg          card oficial (06/11, 14h30)
assets/ifba-logo-branco.png         logo do IFBA branco, usado só no cabeçalho e no favicon
materiais/ficha-clinica-vida-plena.pdf  ficha da empresa fictícia usada na prática guiada
```

## Links externos publicados

Apenas estes três, todos abrindo em nova aba:

- Inscrição: https://forms-oficina.vercel.app
- Avaliação (Google Forms): https://docs.google.com/forms/d/e/1FAIpQLSf3szuUv0lMTmQ0No0h2M58MtUDjAt1Ikq2Wccn9To1Xn9Zdw/viewform
- PDF das demonstrações (Drive): https://drive.google.com/file/d/14tuvN_hMzmJAOq1V8ip7QSevkIUVrEZ2/view

As páginas do Notion são material interno da equipe: **não** aparecem no site e não há link para elas. Cada cartão de bloco abre, no próprio site, um resumo escrito a partir do conteúdo atual das páginas do Notion (objetivo, o que acontece e o que fica). Os logos do IFBA também não são oferecidos para download — o logo branco serve apenas ao cabeçalho.

## Seções da página

1. Abertura com o card, data, local e os botões de inscrição
2. O que a oficina ensina (+ faixa com data, horário e local)
3. Os 10 blocos (cartões expansíveis, sem link para o Notion)
4. Materiais da prática (baixar, abrir no Drive, copiar link)
5. Avaliação
6. Ministrantes e apoiadores
7. Rodapé

## Camada de vidro (visual geral)

- **Fundo fixo** (`.backdrop`): cinco retângulos girados e desfocados atrás de toda a página, só com as cores do projeto (#2148C8, #193BA8, #17358F, #111317). É o que dá função ao vidro: como a camada é fixa, os painéis passam por cima dela ao rolar.
- **Dois tipos de vidro:** escuro (véu branco translúcido + texto branco) em cabeçalho, blocos, ensina, avaliação e rodapé; claro (quase opaco, texto na tinta) em materiais e equipe, onde a leitura é longa e o logo precisa ficar nítido.
- **Sem sombra:** profundidade só pelo desfoque, pela borda de 1 px mais clara e pelo reflexo na borda superior (cor chapada).
- **Botões principais em cor sólida** (inscrição, avaliação, baixar ficha, abrir no Drive): nunca em vidro, para manter contraste e alvo de toque.
- **Custo controlado:** o desfoque de fundo fica nos painéis, não em cada um dos 10 cartões; abaixo de 900 px o fundo fica parado e com menos desfoque. O bloco só ganha véu e borda.

## Movimento

1. Entrada em sequência: seções com fade + subida de 280 ms; os 10 blocos em cascata de 40 ms.
2. Fundo vivo: deriva de 33 a 40 s por ciclo, pausada quando a aba fica oculta.
3. Cabeçalho reativo: o vidro ganha opacidade depois de 12 px de rolagem e o indicador desliza entre as âncoras.
4. Brilho que segue o ponteiro nos painéis (só em ponteiro fino; no celular não existe).
5. Feedback de toque de 100 ms e progresso fino no botão de baixar; o botão Copiar link troca o ícone por uma confirmação.
6. Barra de progresso de leitura no topo, em cor sólida.

Tudo isso desliga em `prefers-reduced-motion`; `prefers-reduced-transparency` e `prefers-contrast: more` trocam o vidro por superfícies sólidas, e há reserva sólida para navegador sem `backdrop-filter` (com o prefixo `-webkit-` no CSS).

## Decisões de interface

- Retângulos desfocados só na abertura; o resto da página alterna azul chapado e fundo claro.
- Navegação com quatro rótulos curtos (Início, Blocos, Materiais, Avaliação) em uma linha a partir de 360 px, com `aria-current` na seção atual.
- Número do bloco grande, para servir de referência durante a fala do ministrante.
- Cada bloco é um `<details>`/`<summary>` nativo: abre com clique, toque, Enter ou Espaço, anuncia o estado expandido/recolhido e funciona sem JavaScript. Dentro dele ficam o objetivo em linguagem de aluno, a lista do que acontece e, quando existe, a frase que resume o que fica do bloco.
- Vários blocos podem ficar abertos ao mesmo tempo; a grade usa `align-items: start` para que um cartão aberto não estique o vizinho.
- Ícones em SVG inline, apenas dois: download e link externo. Nenhuma biblioteca.
- Três estados: aviso de download iniciado, aviso com alternativa quando algo falha e confirmação ao copiar o link.
- A página continua completa sem JavaScript; o JS só acrescenta movimento, destaque da seção e avisos — e nunca escreve `style` no HTML (a CSP tem `style-src 'self'`), só propriedades via CSSOM.
- Contraste conferido nos piores casos do fundo: texto branco a 88% sobre o azul mais claro do fundo = 5,5:1; realce #d2dcff = 4,9:1; tinta sobre o vidro claro = 16,7:1.

## Caminhos relativos

O `index.html` referencia `styles.css`, `app.js`, `assets/` e `materiais/` com caminho relativo (sem barra inicial). Assim a página abre igual em três situações: duplo clique no arquivo (file://), pasta publicada em subdiretório e raiz do projeto na Vercel.

## Publicação na Vercel

1. `vercel` na raiz desta pasta, ou arraste a pasta em vercel.com/new.
2. Framework preset: **Other**. Build command: vazio. Output directory: `.` (a raiz do projeto).
3. Não há variável de ambiente nem função serverless.

## Notas

  O único download além da ficha é a ficha em si e o card de divulgação, cujo link discreto fica no topo, ao lado dos botões principais — a arte já aparece em tamanho grande na abertura, então não há seção só para repeti-la.
- O texto alternativo descreve cada imagem; os botões de download informam formato e tamanho antes do clique.
- Nada é gravado: o site não recebe dados de ninguém.
