# Catálogo — esqueleto do projeto

## Estrutura de pastas

```
site/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── dados/
│   ├── produtos.json
│   └── categorias.json
└── imagens/
    ├── produtos/
    └── banners/
```

## Como rodar localmente

Não abra o `index.html` direto no navegador com duplo clique — como o site usa
`fetch()` para carregar os arquivos JSON, o navegador bloqueia isso em
arquivos locais (`file://`) por segurança. Use um servidor local simples:

- **VS Code**: instale a extensão "Live Server" e clique em "Go Live".
- **Python** (já vem instalado na maioria dos sistemas):
  ```
  cd site
  python3 -m http.server 8000
  ```
  Depois acesse `http://localhost:8000` no navegador.

## Como adicionar produtos

1. Coloque a imagem na subpasta da categoria em `imagens/produtos/` — por
   exemplo, `imagens/produtos/oleos_ozonizados/`.
2. Adicione um novo item em `dados/produtos.json`, seguindo o formato:
   ```json
   {
     "id": "prod-010",
     "nome": "Nome do Produto",
     "categoria": "id-da-categoria",
     "preco": 99.90,
     "imagem": "imagens/produtos/arquivo.jpg",
     "descricao": "Descrição curta.",
     "destaque": false
   }
   ```
   O campo `"categoria"` precisa ser **igual** ao `"id"` de uma categoria em
   `categorias.json` (sem acento, sem espaço). O caminho em `"imagem"` pode
   apontar para qualquer subpasta dentro de `imagens/produtos/`.

## Como adicionar/editar uma categoria

Edite `dados/categorias.json`. Cada categoria pode ter um ou mais banners —
o carrossel é criado automaticamente com todas as imagens da lista
`"banners"`.

Se uma categoria não tiver nenhum produto associado, a seção dela
simplesmente não é exibida (o `script.js` já trata esse caso).

## Placeholders de imagem

Enquanto você não tiver a imagem final de um produto ou banner, o site
mostra automaticamente uma imagem de espaço reservado (via
[placehold.co](https://placehold.co)) — assim nada quebra visualmente
durante o desenvolvimento. Isso é tratado em `js/script.js`, na função
`onerror` de cada `<img>`.

## Quando for para um domínio de verdade

Hoje as imagens estão organizadas em subpastas dentro de `imagens/produtos/`,
com os banners de cada categoria dentro da respectiva pasta `banners/`.
Os caminhos são relativos e isso funciona bem enquanto tudo mora na mesma
pasta do site. Quando o projeto crescer, minha sugestão é:

1. **Banco de dados**: migrar `produtos.json` / `categorias.json` para um
   banco gerenciado, como Firebase (Firestore) ou Supabase (Postgres) — ambos
   têm plano gratuito e painel visual para cadastrar produtos sem mexer em
   código.
2. **Imagens**: subir para um serviço de storage/CDN (Cloudinary, Firebase
   Storage ou Amazon S3) em vez de manter na pasta do site. No banco, você
   passa a guardar apenas a **URL completa** da imagem no lugar do caminho
   relativo — o resto do código (`<img src="...">`) não muda.
3. O `script.js` pode trocar `fetch("dados/produtos.json")` por
   `fetch("https://sua-api.com/produtos")` sem precisar alterar o resto da
   lógica de montagem das seções.
