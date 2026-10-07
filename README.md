# Personal Pokédex

Uma coleção pessoal de Pokémon capturados, feita com React, JavaScript e Vite. Cadastre suas descobertas, consulte seus cards e alterne entre os temas claro e escuro. A identidade verde, as superfícies sólidas e os espaços generosos aproximam o projeto do [portfólio de Felipe Jordão Fernandes](https://felipe-jordao-portfolio.vercel.app/).

[Aplicação em produção](https://personal-pokedex.vercel.app/) · [Repositório](https://github.com/FelipeJordaoFernandes/personal-pokedex)

As mudanças de identidade e qualidade desta etapa seguem por PR; a URL de produção só recebe essa versão após aprovação e merge.

## Funcionalidades

- Cadastro manual ou preenchimento pelo número usando a PokeAPI.
- Cards com artwork, nome, número e tipos; coleção ordenada pelo número.
- Busca por nome, número ou tipo, sem diferenciar maiúsculas e minúsculas.
- Bloqueio de números duplicados e remoção de capturas.
- Coleção e preferência de tema salvas no `localStorage` deste navegador.
- Preferência de tema do sistema na primeira visita; tema aplicado antes da renderização.
- Tratamento de falha da API, imagem indisponível e armazenamento bloqueado ou inválido.
- Layout para celular, tablet e desktop; navegação por teclado, foco visível, atalhos para a coleção e mensagens anunciadas por leitores de tela.
- HTML público pré-renderizado no build, metadados sociais, favicon verde, canonical, robots e sitemap.

## Executar

Requer Node.js 22.12+ ou 24+ e npm. Validação desta etapa feita com Node.js 24.

```bash
git clone https://github.com/FelipeJordaoFernandes/personal-pokedex.git
cd personal-pokedex
npm ci
npm run dev
```

Para conferir a versão de produção local:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

O build gera arquivos estáticos em `dist`. Não há servidor de aplicação ou banco de dados. `scripts/build.mjs` usa o SSR do Vite somente durante o build para gerar o HTML público; a coleção pessoal é restaurada no navegador após a hidratação. Os controles de cadastro ficam desabilitados no HTML inicial até o React carregar.

## Verificações

```bash
npm run lint
npm test
npm run build
npm audit
```

Com a prévia de produção em execução, em outro terminal:

```bash
npm run audit:ui
npm run audit:lighthouse
npm run audit:live
```

- `audit:ui`: Playwright + axe, cinco larguras (320, 390, 768, 1024 e 1440 px), ambos os temas, coleção vazia/preenchida, erros, busca, teclado, reload, texto ampliado e falhas de armazenamento. Usa dados fictícios e uma API simulada em contextos isolados.
- `audit:lighthouse`: três medições por perfil mobile/desktop e por tema, em perfis descartáveis, coleção vazia e cache de rede limpo. Salva relatórios HTML/JSON e o resumo em `artifacts/lighthouse`.
- `audit:live`: integração real com PokeAPI e artworks, seis cadastros, número inexistente e falha de conexão simulada. Requer internet e gera capturas de tela em `artifacts/live`.

Os scripts usam Microsoft Edge instalado, sem acessar seu perfil pessoal. Para Chrome, configure `AUDIT_BROWSER=chrome`. `AUDIT_URL` permite mudar o endereço da prévia. `AUDIT_RUNS`, `AUDIT_THEMES=light,dark` e `AUDIT_PHASE` controlam as medições Lighthouse. Em PowerShell, por exemplo:

```powershell
$env:AUDIT_URL = 'http://127.0.0.1:4173/'
$env:AUDIT_PHASE = 'minha-auditoria'
npm run audit:lighthouse
```

Resultados e limites da revisão estão em [docs/quality.md](docs/quality.md). `artifacts` contém evidências locais regeneráveis e não é versionado. Os testes não representam certificação de conformidade WCAG nem medições de tráfego real em produção.

## Estrutura

```text
public/                 Favicon, compartilhamento, SEO e licenças das fontes
scripts/                Build com pré-renderização e auditorias
src/components/         Header, tema, formulário, busca e cards
src/hooks/              Coleção, tema e estado de hidratação
src/services/           PokeAPI e leitura compatível dos dados locais
src/entry-server.jsx    Renderização estática pública, sem dados pessoais
tests/                  Regressões de persistência e integração PokeAPI
docs/quality.md         Metodologia, resultados e limites
```

## Dados e dependências externas

As chaves legadas `pokedex-go-collection` e `pokedex-go-theme` foram preservadas para manter as coleções existentes. Não há conta, sincronização entre dispositivos ou backup remoto. Limpar os dados do site pode apagar sua coleção. Se os dados salvos não puderem ser lidos, o conteúdo original é preservado e novas alterações ficam somente na sessão; o aplicativo avisa quando não consegue salvar.

O preenchimento depende da [PokeAPI](https://pokeapi.co/); as imagens sugeridas são servidas pelo repositório de sprites da PokeAPI. URLs de imagens manuais devem usar HTTPS. As requisições de imagem usam `no-referrer`, dimensões reservadas e carregamento adiado. Imagens externas e tamanhos de coleção diferentes podem alterar o desempenho.

Inter e Plus Jakarta Sans são fontes locais, distribuídas via Fontsource sob SIL OFL; licenças em `public/licenses`. Essa combinação é uma escolha experimental deste projeto, sem estabelecer um padrão tipográfico global. Os SVGs da marca e do compartilhamento têm fontes em `public`; `npm run assets:brand` regenera os PNGs correspondentes.

Projeto pessoal de estudo, sem vínculo com Nintendo, Game Freak ou The Pokémon Company.

## Possibilidades futuras

Edição de capturas, filtro dedicado por tipo, prévia antes do cadastro e sincronização entre dispositivos continuam fora desta implementação, sem ordem de prioridade definida.
