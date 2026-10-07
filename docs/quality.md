# Revisão de identidade e qualidade — 2026-10-07

## Complemento: resposta do seletor de tema — 2026-10-07

Correção na branch `Ada/toggle-icons-instantaneo`, sobre `ea1dee9`. Antes, um único `<img>` trocava de `src` ao clicar, e o estado do tema em `App` fazia a coleção inteira renderizar novamente. Agora Solrock e Lunatone ficam montados, carregados e com decodificação antecipada. CSS seleciona o ícone pelo mesmo `data-theme` da paleta, atualizado no próprio handler do clique. O estado React pertence somente ao toggle; persistência e rótulo acessível continuam funcionando.

Medição comparativa no build de produção local, Edge headless, viewport 1440 × 1000 e CPU desacelerada 6×. Contextos isolados com 6 ou 300 cards fictícios, imagens locais e seis alternâncias por tema inicial (12 amostras por tamanho e versão). O intervalo medido é do clique programático ao primeiro callback `requestAnimationFrame`, com conferência do tema e das imagens carregadas; não é INP nem medição do pixel apresentado na tela.

| Coleção | Mediana anterior | Mediana corrigida | Máximo anterior | Máximo corrigido |
| --- | --- | --- | --- | --- |
| 6 cards | 7,2 ms | 2,7 ms | 13,0 ms | 67,3 ms |
| 300 cards | 21,1 ms | 2,7 ms | 36,5 ms | 6,0 ms |

Ambos os ícones já carregados em todas as amostras corrigidas; zero alterações de `src`, contra uma por clique antes. O atraso considerável relatado não foi reproduzido localmente. A mediana caiu, mas houve uma amostra de 67,3 ms com seis cards: escalonamento do navegador/sistema e pintura ainda variam, portanto não se garante latência máxima em outros dispositivos. Dados completos em [toggle-summary.json](toggle-summary.json).

Validação desta correção: lint, cinco testes, build e diff aprovados; `audit:toggle` cobriu 320/390/768/1024/1440 px, ambos os temas, Enter/Espaço, dez cliques no mesmo evento, persistência após reload, armazenamento bloqueado e nenhuma requisição de imagem ao alternar. `audit:ui` foi reexecutado: 25 verificações axe sem violações ou itens incompletos, fluxos preservados e nenhum erro JS. Inspeção visual dos ícones em mobile escuro e desktop claro aprovada. Lighthouse e integração real com PokeAPI não foram repetidos nesta correção; resultados abaixo pertencem à revisão anterior.

## Revisão anterior

Revisão na branch `Ada/identidade-visual-qualidade`, a partir de `main` em `0adf9dff79716f7bf03ae2a305159bf46f01ae36`. A identidade foi aplicada conforme o guia pessoal consultado no Obsidian e a paleta conferida no código do portfólio. Valores do tema claro são adaptações locais. Inter e Plus Jakarta Sans são uma experiência tipográfica deste projeto, sem aprovação como padrão global.

## O que mudou

- Marca e título **Personal Pokédex**, favicon de Pokébola verde, PNG para navegador/Apple e imagem de compartilhamento.
- Verde do portfólio (`#76b98d`, `#245f3a`, `#202824`, `#2a3530`, `#edf3ed`), superfícies sólidas, sombras leves, hierarquia e responsividade.
- Sem vidro, desfoque ou animações contínuas. Transições discretas respeitam movimento reduzido.
- Foco visível, rótulos corretos, áreas de toque, atalho para a coleção, feedbacks com região viva e foco recuperado após remoção.
- Formulário bloqueado durante consulta para impedir mistura de respostas com um número editado; retorno para cadastro manual em caso de falha.
- Imagens com dimensões reservadas, carregamento adiado, `decoding=async`, `no-referrer` e fallback. Novas URLs manuais exigem HTTPS.
- Fontes locais no subconjunto latino e preload; HTML público gerado no build, sem coleção pessoal incorporada. Restauração dos registros após hidratação e controles de cadastro inicialmente desabilitados.
- Descrição, canonical, Open Graph/Twitter, robots e sitemap da página pública.
- Chaves e formato legados de armazenamento preservados. Leitura não sobrescreve dados; erro de leitura mantém o conteúdo original, e falha de gravação avisa sobre persistência apenas na sessão.
- Atualizações compatíveis nas ferramentas via `npm audit fix`, sem `--force`; Vite efetivo 8.3.3, sem mudar de versão principal. `npm audit` retornou zero alertas conhecidos nesta consulta.

## Lighthouse

Build de produção servido em `http://127.0.0.1:4175/`, Windows, Microsoft Edge headless, Lighthouse 13.5.0, Node.js 24.14.0. Perfil mobile com throttling simulado padrão (CPU 4×); desktop com a configuração oficial correspondente. Perfis descartáveis, cache de rede limpo, coleção vazia e tema definido antes de cada medição. A coleção vazia torna as medições comparáveis, sem requests de artworks externos.

A referência inicial teve uma medição por perfil, no tema claro: performance 100, acessibilidade 100, boas práticas 100 e SEO 83. Os achados de SEO eram a falta de metadescrição e o retorno de HTML no caminho de `robots.txt`.

Resultados finais: **mediana de três medições por perfil e tema** (12 medições no total).

| Perfil | Tema | Performance | Acessibilidade | Boas práticas | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Mobile | Claro | 100 | 100 | 100 | 100 |
| Mobile | Escuro | 100 | 100 | 100 | 100 |
| Desktop | Claro | 100 | 100 | 100 | 100 |
| Desktop | Escuro | 100 | 100 | 100 | 100 |

Performance mobile variou entre 99 e 100. TBT ficou em 0 ms. FCP mobile ficou próximo de 1,2 s e LCP entre 1,7 e 1,9 s; os valores individuais e demais métricas estão no resumo JSON. As notas são de laboratório local e podem variar conforme máquina, rede, hospedagem e coleção.

Durante a auditoria foi corrigida a divergência entre o texto visível e o nome acessível do botão de tema, mesmo sem desconto na nota principal. Os relatórios mantêm a indicação de cerca de 32 KiB de JavaScript não exercitado na carga inicial; parte do runtime é usada pelos fluxos interativos. O apontamento de bfcache informa `BackForwardCacheDisabledByCommandLine`, uma opção do navegador lançado pelo Playwright. Não foi feita alteração do aplicativo para contornar esse artefato do ambiente de teste.

Relatórios completos locais: `artifacts/lighthouse/baseline` e `artifacts/lighthouse/release`; resumo durável em [audit-summary.json](audit-summary.json). Esses relatórios não medem a produção antiga nem equivalem a Core Web Vitals de usuários reais.

## Acessibilidade e fluxos

`audit:ui`: **25 verificações axe, zero violações e zero verificações incompletas** no roteiro final. Cobertura: 320, 390, 768, 1024 e 1440 px, ambos os temas, estados vazio e preenchido, duplicata, busca vazia e texto em 200% a 390 px. Sem transbordamento horizontal nos cenários medidos.

Verificação de teclado: skip link, destino com foco, ação de primeira captura, foco no número após registro e retorno do foco ao título da coleção após remoção. Busca por nome, número e tipo, limpeza da busca, duplicatas, persistência da coleção/tema e reload passaram. Armazenamento bloqueado e JSON inválido foram testados em contextos isolados; o conteúdo inválido permaneceu byte a byte após uma tentativa de inclusão.

HTML pré-renderizado: título principal presente com JavaScript desabilitado, cadastro desabilitado e texto `noscript` presente no documento. Leitores de tela reais, todos os navegadores, zoom de navegador em todas as larguras e WCAG integral não foram auditados. As notas automáticas não são certificação de conformidade.

`audit:live`: seis respostas reais HTTP 200 da PokeAPI para Bulbasaur, Charmander, Squirtle, Pikachu, Gengar e Eevee; seis artworks válidos. Número inexistente retornou 404 e feedback correto. Falha de conexão simulada exibiu orientação para tentar novamente ou cadastrar manualmente. Nenhum erro JavaScript não tratado nesse roteiro. As capturas em `artifacts/live` usam somente essas seis entradas de teste, sem modificar dados pessoais.

## Verificações de código e limites

- `npm run lint`, cinco testes `node:test`, build com pré-renderização e `git diff --check`: aprovados.
- `npm audit` e `npm audit --omit=dev`: zero alertas na consulta desta etapa; o resultado não é garantia sobre vulnerabilidades futuras.
- Licenças SIL OFL de ambas as fontes distribuídas em `public/licenses`.
- Integração real com PokeAPI/artworks validada separadamente das medições Lighthouse; coleção com muitas imagens ou fontes externas diferentes pode ter outro desempenho.
- Sem backend, contas, sincronização ou backup remoto. A chave legada é intencional; a mudança de nome não migra nem apaga a coleção.
- A produção recebe as alterações somente após aprovação e merge da PR. A prévia Vercel e seu estado são registrados na PR e na continuidade do projeto.
