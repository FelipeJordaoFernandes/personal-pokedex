# Pokédex Go

Pokédex pessoal desenvolvida com `React` e `Vite`, inspirada no universo de `Pokémon` e pensada para registrar os Pokémons capturados de forma visual, interativa e responsiva.

## Deploy

A aplicação está disponível em:

[`https://personal-pokedex.vercel.app/`]

## Funcionalidades

- cadastro manual de Pokémons
- auto preenchimento dos dados pelo número da Pokédex com integração à `PokeAPI`
- exibição dos Pokémons em cards com nome, imagem, número e tipos
- busca por nome, número ou tipo
- remoção de cards cadastrados
- persistência de dados no navegador com `localStorage`
- alternância entre tema `light` e `dark`
- layout responsivo para desktop e mobile

## Tecnologias utilizadas

- `React`
- `Vite`
- `JavaScript`
- `CSS3`
- `ESLint`
- `PokeAPI`
- `Vercel`

## Como rodar localmente

Clone o repositório e instale as dependências:

```bash
git clone <url-do-repositorio>
cd pokedex-go
npm install
```

Depois, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

## Aprendizados do projeto

Durante o desenvolvimento deste projeto, pratiquei e evoluí principalmente em:

- criação de interfaces com `React`
- organização de projeto em componentes, hooks e services
- consumo de API externa com `fetch`
- gerenciamento de estado com hooks
- persistência de dados no navegador com `localStorage`
- construção de interface responsiva para diferentes tamanhos de tela
- refinamento visual com temas claro e escuro

## Melhorias futuras

- permitir edição de Pokémons já cadastrados
- adicionar filtros por tipo
- criar pré-visualização do card antes do cadastro
- armazenar os dados em banco para compartilhamento entre dispositivos
- adicionar animações e transições mais ricas na interface
- incluir testes automatizados
