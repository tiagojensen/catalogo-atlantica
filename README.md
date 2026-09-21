# Catálogo Atlântica Natural

Site catálogo de produtos da Atlântica Natural, desenvolvido com HTML5, CSS3 e JavaScript puro. O projeto é estático, responsivo e orientado por dados: produtos, categorias e carrosséis são carregados de arquivos JSON, sem necessidade de alterar o HTML para cada novo item.

## Visão geral

O site apresenta:

- catálogo de produtos organizado por categorias;
- banners de categoria;
- cards de produto com imagem, nome, categoria, descrição resumida e preços;
- preço de tabela riscado e preço de consultor calculado automaticamente com 50% de desconto;
- modal com a descrição completa e os preços do produto;
- menu superior responsivo com Produtos, Catálogos, Seja um consultor e Sobre nós;
- menu de categorias gerado automaticamente a partir de `dados/categorias.json`;
- carrosséis editoriais reutilizáveis, atualmente usados para os protocolos;
- abertura de PDFs em nova aba para visualização e download;
- seção de consultor com link para cadastro;
- botão flutuante do WhatsApp;
- rodapé responsivo com navegação e contato;
- suporte a desktop, tablet e celular;
- tema claro forçado em todos os dispositivos.

## Como o site funciona

Ao abrir a página, `js/script.js` faz três requisições com `fetch()`:

1. `dados/produtos.json` — lista de produtos;
2. `dados/categorias.json` — categorias, nomes e banners;
3. `dados/carrosseis.json` — carrosséis editoriais, como os protocolos.

Depois que os arquivos são carregados:

1. o menu Produtos é preenchido com as categorias;
2. cada categoria com produtos recebe uma seção própria;
3. os banners da categoria são inseridos no carrossel da seção;
4. os cards dos produtos são criados dinamicamente;
5. os carrosséis editoriais são montados a partir do template reutilizável;
6. os eventos de menu, modal, arraste, setas e navegação são ativados.

Se uma categoria não tiver nenhum produto associado, ela não é exibida.

## Estrutura de pastas

```text
site/
├── index.html                         # Estrutura principal e templates HTML
├── css/
│   └── style.css                      # Tokens visuais, layout e responsividade
├── js/
│   └── script.js                      # Carregamento de dados e interações
├── dados/
│   ├── produtos.json                  # Produtos do catálogo
│   ├── categorias.json                # Categorias e banners de categorias
│   └── carrosseis.json                # Carrosséis editoriais reutilizáveis
├── arquivos/
│   ├── catalogo_atl_2026.pdf          # Catálogo completo
│   └── protocolos_atl.pdf             # PDF completo de protocolos
└── imagens/
    ├── logo.png                       # Logo usada no cabeçalho e no rodapé
    ├── frete-gratis.png               # Arte da abertura institucional
    ├── produtos/
    │   ├── academia/
    │   │   └── banners/
    │   ├── chas/
    │   │   └── banners/
    │   ├── cosmeticos/
    │   │   └── banners/
    │   ├── nutraceuticos/
    │   │   └── banners/
    │   ├── oleos_essenciais/
    │   │   └── banners/
    │   ├── oleos_ozonizados/
    │   │   └── banners/
    │   ├── vitaminas/
    │   │   └── banners/
    │   └── wave/
    │       └── banners/
    └── protocolos/
        ├── imagens JPG dos protocolos
        └── PDFs individuais dos protocolos
```

Os nomes de arquivos precisam ser usados exatamente como estão nas pastas. Isso é especialmente importante em hospedagens Linux, que diferenciam letras maiúsculas e minúsculas.

## Produtos: `dados/produtos.json`

Cada produto é um objeto dentro de um array:

```json
{
  "id": "prod-001",
  "nome": "Nome do Produto",
  "categoria": "id-da-categoria",
  "preco": 119.98,
  "imagem": "imagens/produtos/pasta-produto/imagem.png",
  "descricao": "Descrição curta exibida no card.",
  "descricaoCompleta": "Descrição detalhada exibida na modal.",
  "destaque": false,
  "fonte": "https://exemplo.com/produto/"
}
```

### Campos

| Campo | Obrigatório | Uso |
|---|---:|---|
| `id` | Sim | Identificador único do produto. |
| `nome` | Sim | Nome exibido no card e na modal. |
| `categoria` | Sim | Deve ser exatamente igual ao `id` de uma categoria. |
| `preco` | Sim | Preço de tabela em número, sem `R$`. |
| `imagem` | Sim | Caminho relativo para a imagem. |
| `descricao` | Recomendado | Resumo exibido no card. |
| `descricaoCompleta` | Opcional | Texto exibido na modal; se não existir, usa `descricao`. |
| `destaque` | Opcional | Campo reservado para futuras regras de destaque. |
| `fonte` | Opcional | URL de referência; atualmente é apenas metadado. |

### Preço de consultor

O site não grava um segundo preço no JSON. Ele calcula automaticamente:

```text
preço de consultor = preço de tabela / 2
```

O card exibe o preço de tabela com risco, o texto `Preço de consultor · 50% OFF` e o preço calculado em destaque. A mesma informação aparece na modal de detalhes. Para alterar os dois valores, basta alterar `preco` no JSON.

### Como adicionar um produto

1. Coloque a imagem dentro da pasta da categoria em `imagens/produtos/`.
2. Copie um objeto existente em `dados/produtos.json`.
3. Altere o `id`, `nome`, `categoria`, `preco`, `imagem` e as descrições.
4. Confirme que o caminho da imagem está correto.
5. Valide o JSON antes de publicar.

Exemplo:

```json
{
  "id": "vit-023",
  "nome": "NOVO PRODUTO",
  "categoria": "vitaminas",
  "preco": 99.98,
  "imagem": "imagens/produtos/vitaminas/novo produto.png",
  "descricao": "Descrição resumida do produto.",
  "descricaoCompleta": "Descrição detalhada do produto para a modal.",
  "destaque": false
}
```

## Categorias: `dados/categorias.json`

Cada objeto define uma seção de produtos:

```json
{
  "id": "vitaminas",
  "nome": "Vitaminas",
  "banners": [
    "imagens/produtos/vitaminas/banners/banner_01.png"
  ]
}
```

### Campos

- `id`: identificador usado no JSON dos produtos e nas âncoras do menu;
- `nome`: nome visível no menu e no título da seção;
- `banners`: lista de imagens usadas no banner da categoria.

As categorias são renderizadas na ordem em que aparecem no arquivo. Atualmente existem Vitaminas, Óleos Essenciais, Óleos Ozonizados, Wave Global, Chás, Academia, Nutracêuticos e Cosméticos Ozonizados.

### Como adicionar uma categoria

1. Crie a pasta em `imagens/produtos/`.
2. Crie a subpasta `banners` dentro dela.
3. Coloque o banner e as imagens dos produtos.
4. Adicione um objeto em `dados/categorias.json`.
5. Adicione os produtos em `dados/produtos.json`, usando o mesmo `id` no campo `categoria`.

Não é necessário editar o menu ou criar manualmente uma seção no HTML.

## Carrosséis reutilizáveis: `dados/carrosseis.json`

Carrosséis editoriais são independentes das seções de produtos. Eles são inseridos no elemento `#carrosseis` usando o template `#template-carrossel` de `index.html`.

O formato atual é:

```json
{
  "id": "protocolos",
  "eyebrow": "Guias de bem-estar",
  "titulo": "Encontre um protocolo para sua rotina",
  "descricao": "Texto de apoio do carrossel.",
  "botao": {
    "texto": "Confira todos os protocolos",
    "link": "arquivos/protocolos_atl.pdf"
  },
  "itens": [
    {
      "id": "emagrecimento",
      "nome": "Emagrecimento",
      "imagem": "imagens/protocolos/emagrecimento.jpg",
      "link": "imagens/protocolos/emagrecimento.pdf"
    }
  ]
}
```

### Fluxo do carrossel

- cada objeto do array cria um carrossel completo;
- cada item gera um card com imagem, nome e link;
- o card central recebe destaque visual e fica maior;
- setas, bolinhas e arraste por mouse/toque alteram o item ativo;
- o ciclo é infinito: cópias internas dos itens evitam espaços vazios nas pontas;
- clicar em um card abre o arquivo definido em `link` em nova aba;
- o botão inferior é definido por `botao.texto` e `botao.link`;
- se no futuro houver outro carrossel, basta adicionar outro objeto ao array.

Não é necessário duplicar HTML nem escrever imagens diretamente no `index.html`.

### Como criar outro carrossel

Adicione outro objeto ao array de `dados/carrosseis.json`:

```json
{
  "id": "novidades",
  "eyebrow": "Lançamentos",
  "titulo": "Conheça nossas novidades",
  "descricao": "Produtos e materiais recentes.",
  "botao": {
    "texto": "Ver novidades",
    "link": "#produtos"
  },
  "itens": [
    {
      "id": "item-01",
      "nome": "Nome do item",
      "imagem": "imagens/caminho/item.jpg",
      "link": "imagens/caminho/item.pdf"
    }
  ]
}
```

## Protocolos e PDFs

Os protocolos têm dois usos: imagem JPG no carrossel visual e PDF individual aberto ao clicar no card.

O PDF completo é acessado pelo botão do carrossel e pelo menu superior de Catálogos:

```text
arquivos/protocolos_atl.pdf
```

O catálogo completo de 2026 está em:

```text
arquivos/catalogo_atl_2026.pdf
```

O navegador abre esses arquivos em nova aba, onde o visitante pode visualizar e baixar o PDF.

Como os protocolos tratam de temas de saúde, o conteúdo deve ser revisado por um profissional responsável antes da publicação. O site deve apresentar os materiais como informação e orientação de leitura, sem transformar o catálogo em diagnóstico ou prescrição.

## Interface e fluxos de navegação

### Cabeçalho

O cabeçalho é sticky e contém logo, Início, Produtos, Catálogos, Seja um consultor e Sobre nós. A logo retorna ao início. Produtos recebe suas opções automaticamente a partir das categorias. Catálogos abre os PDFs do catálogo 2026 e dos protocolos. Sobre nós abre uma modal.

No desktop, Produtos e Catálogos abrem o submenu ao passar o mouse ou clicar. No celular, o menu é aberto pelos três pontos e os submenus funcionam por toque.

### Produtos

Cada seção de categoria possui banner, título, quantidade de itens, grid responsivo de produtos e cards com imagem, descrição e preços. O botão `Ver detalhes` abre a modal do produto.

As categorias atuais possuem um banner principal cada, por isso não exibem setas laterais nos banners de produtos.

### Modal de produto

Ao clicar em `Ver detalhes`, a imagem é ampliada, a descrição completa é exibida e os dois preços são mostrados. A modal fecha pelo botão, clicando fora ou usando `Esc`.

### Consultor

Existem chamadas para consultor no menu, no início — quando esse bloco estiver ativado —, no final da página e no rodapé. Todas apontam para:

```text
https://cadastro.atlanticanatural.com.br/imperialdiamante
```

### Contato e WhatsApp

O telefone exibido é `(42) 99980-8084`. O contato e o botão flutuante abrem:

```text
https://wa.me/5542999808084
```

## Estado inicial temporariamente desativado

No momento, o bloco inicial com frete grátis, Sobre a empresa e o consultor inicial está comentado no `index.html`. O bloco `Nossos produtos` está ativo, assim como o carrossel de protocolos acima dele.

Para reativar o bloco inicial, remova os marcadores HTML:

```html
<!-- BLOCO INICIAL TEMPORARIAMENTE DESATIVADO
...
FIM DO BLOCO INICIAL DESATIVADO -->
```

## Responsividade

O arquivo `css/style.css` utiliza CSS Grid, Flexbox, `clamp()` e media queries:

- desktop: banners e grids aproveitam a largura da tela;
- tablet: a quantidade de colunas é reduzida;
- celular: grid de produtos, menu, carrosséis e rodapé são reorganizados;
- carrosséis aceitam arraste horizontal no toque;
- o tema claro é forçado por `color-scheme: light` no HTML e no CSS.

As imagens de banner podem ocupar a largura total da janela, enquanto os produtos respeitam margens menores para aproveitar melhor a tela.

## Identidade visual

As principais variáveis estão no início de `css/style.css`:

```css
--paper: #EFEAE0;
--paper-card: #F8F5EE;
--ink: #21261F;
--ink-soft: #4B5147;
--gold: #B8872E;
--rust: #9C4A32;
--line: #D9D2C1;
```

As fontes utilizadas são Fraunces para títulos e Archivo para textos, carregadas pelo Google Fonts no `index.html`.

## Como executar localmente

Não abra `index.html` diretamente com duplo clique. O site usa `fetch()` para carregar os JSONs, e o navegador bloqueia esse acesso em `file://`.

### Python no Windows

Abra o Prompt de Comando ou PowerShell e execute:

```powershell
cd "C:\Users\Usuario\Downloads\site"
python -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador. Para encerrar o servidor, pressione `Ctrl + C`.

### VS Code

Também é possível instalar a extensão Live Server e usar `Go Live` no `index.html`.

## Validações antes de publicar

Confira se:

1. os JSONs estão válidos;
2. todos os caminhos de imagens existem;
3. letras maiúsculas, acentos, espaços e extensões estão iguais aos nomes dos arquivos;
4. o `id` da categoria é igual ao campo `categoria` dos produtos;
5. os PDFs abrem em nova aba;
6. o site foi testado em celular e computador;
7. não existem erros no Console do navegador.

Validação rápida do JavaScript:

```powershell
node --check js/script.js
```

Validação dos JSONs:

```powershell
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('dados/produtos.json','utf8')); JSON.parse(fs.readFileSync('dados/categorias.json','utf8')); JSON.parse(fs.readFileSync('dados/carrosseis.json','utf8')); console.log('JSONs válidos');"
```

## Problemas comuns

### Produtos não aparecem

Verifique se o servidor local está rodando, se `dados/produtos.json` está válido e se o campo `categoria` corresponde exatamente ao `id` em `categorias.json`.

### Imagem aparece como placeholder

O caminho em `imagem` está errado ou o nome do arquivo não corresponde exatamente ao arquivo na pasta. Confira maiúsculas, acentos, espaços e extensão.

### O site não atualiza

O `fetch()` usa `cache: "no-store"` durante o desenvolvimento. Se o navegador ainda mostrar uma versão antiga, faça um hard refresh (`Ctrl + F5`) ou abra uma janela anônima.

### PDF não abre

Confira o caminho, o nome exato do arquivo e se o PDF está dentro do projeto. Em hospedagem Linux, `Pressão alta.pdf` e `pressao alta.pdf` são arquivos diferentes.

## Publicação no GitHub Pages

1. Faça commit das alterações:

   ```powershell
   git add .
   git commit -m "Atualiza catálogo"
   git push
   ```

2. No repositório do GitHub, abra `Settings` → `Pages`.
3. Em `Build and deployment`, escolha `Deploy from a branch`.
4. Selecione a branch `main` e a pasta `/ (root)`.
5. Salve e aguarde a publicação.

O GitHub Pages funciona diretamente com este projeto porque todos os arquivos são estáticos e os caminhos são relativos.

## Evolução futura

Para crescer o projeto sem reescrever a interface:

- continuar adicionando produtos e categorias pelos JSONs;
- criar novos carrosséis em `dados/carrosseis.json`;
- migrar os JSONs para uma API ou banco de dados;
- armazenar imagens em CDN ou storage;
- adicionar filtros por preço, busca e tags;
- criar páginas individuais de produto;
- conectar botões de compra às URLs específicas da loja;
- adicionar um painel administrativo para cadastrar produtos sem editar arquivos.

O ponto principal da arquitetura é separar conteúdo e apresentação: o HTML contém templates, o JavaScript monta a interface e os arquivos JSON controlam os dados exibidos.
