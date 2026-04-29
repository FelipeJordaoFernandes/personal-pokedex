# Pokédex Go

Pokédex pessoal feita com `React` e `Vite`.

O projeto permite registrar os Pokémons que você já capturou, exibindo cards com:

- nome
- número da Pokédex
- imagem
- tipos

## Funcionalidades

- cadastro manual de Pokémons
- auto preenchimento pelo número da Pokédex usando a `PokeAPI`
- busca por nome, número ou tipo
- remoção de cards
- persistência no `localStorage`
- alternância entre tema `light` e `dark`
- layout responsivo para desktop e mobile

## Tecnologias

- `React`
- `Vite`
- `ESLint`

## Como rodar o projeto

```bash
npm install
npm run dev
```

Depois, abra o endereço exibido no terminal.

## Scripts disponíveis

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Publicação na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Acesse a `Vercel` e escolha a opção de importar um projeto do GitHub.
3. Selecione o repositório da `Pokédex Go`.
4. A Vercel deve detectar automaticamente que o projeto usa `Vite`.
5. Confirme o deploy.

Configuração usada neste projeto:

- `build command`: `npm run build`
- `output directory`: `dist`

## Observação sobre os dados

Os Pokémons cadastrados e o tema escolhido ficam salvos no `localStorage`.
Isso significa que os dados permanecem no navegador de cada pessoa que acessar o site, mas não são compartilhados entre dispositivos ou usuários.

## Estrutura principal

```text
src/
  App.jsx
  App.css
  index.css
  assets/
public/
  favicon.svg
```

## Observações

- os dados ficam salvos no navegador do usuário via `localStorage`
- o auto preenchimento depende de conexão com a internet para consultar a `PokeAPI`
