/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */
const CAMINHO_PRODUTOS = "dados/produtos.json";
const CAMINHO_CATEGORIAS = "dados/categorias.json";
const IMAGEM_PADRAO = "https://placehold.co/600x600/EFEAE0/9C4A32?text=Sem+imagem";
const IMAGEM_BANNER_PADRAO = "https://placehold.co/1600x600/21261F/EFEAE0?text=Banner";

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("ano-atual").textContent = new Date().getFullYear();
  iniciarMenuMobile();
  iniciarDropdowns();
  iniciarModalProduto();
  iniciarModalSobreNos();

  try {
    const [produtos, categorias] = await Promise.all([
      buscarJSON(CAMINHO_PRODUTOS),
      buscarJSON(CAMINHO_CATEGORIAS),
    ]);

    montarMenusCategorias(categorias);
    montarSecoesDeCategoria(categorias, produtos);
  } catch (erro) {
    console.error("Não foi possível carregar o catálogo:", erro);
    document.getElementById("mensagem-carregando").textContent =
      "Não foi possível carregar o catálogo agora. Tente novamente em instantes.";
  }
});

async function buscarJSON(caminho) {
  const resposta = await fetch(caminho, { cache: "no-store" });
  if (!resposta.ok) throw new Error(`Falha ao buscar ${caminho}`);
  return resposta.json();
}

/* =========================================================
   MENU (mobile + dropdowns)
   ========================================================= */
function iniciarMenuMobile() {
  const botao = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  botao.addEventListener("click", () => {
    const aberto = nav.classList.toggle("aberto");
    botao.setAttribute("aria-expanded", String(aberto));
  });
}

function iniciarDropdowns() {
  document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
    const gatilho = dropdown.querySelector(".nav-dropdown-trigger");
    const menu = dropdown.querySelector(".nav-dropdown-menu");

    gatilho.addEventListener("click", (evento) => {
      evento.stopPropagation();
      const aberto = menu.classList.toggle("aberto");
      gatilho.setAttribute("aria-expanded", String(aberto));
    });

    document.addEventListener("click", (evento) => {
      if (!dropdown.contains(evento.target)) {
        menu.classList.remove("aberto");
        gatilho.setAttribute("aria-expanded", "false");
      }
    });
  });
}

function montarMenusCategorias(categorias) {
  const menu = document.getElementById("menu-categorias");

  categorias.forEach((categoria) => {
    const link = document.createElement("a");
    link.href = `#categoria-${categoria.id}`;
    link.textContent = categoria.nome;
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-dropdown-menu").forEach((menuDoSite) => {
        menuDoSite.classList.remove("aberto");
      });
      document.querySelectorAll(".nav-dropdown-trigger").forEach((gatilhoDoSite) => {
        gatilhoDoSite.setAttribute("aria-expanded", "false");
      });
      document.getElementById("main-nav").classList.remove("aberto");
      document.getElementById("nav-toggle").setAttribute("aria-expanded", "false");
    });
    menu.appendChild(link);
  });
}

/* =========================================================
   SEÇÕES DE CATEGORIA (banner + grade de produtos)
   Esta é a estrutura repetida: montada UMA função,
   chamada uma vez para cada categoria do catálogo.
   ========================================================= */
function montarSecoesDeCategoria(categorias, produtos) {
  const container = document.getElementById("secoes-produtos");
  const templateCategoria = document.getElementById("template-categoria");
  document.getElementById("mensagem-carregando").remove();

  categorias.forEach((categoria) => {
    const produtosDaCategoria = produtos.filter((p) => p.categoria === categoria.id);
    if (produtosDaCategoria.length === 0) return;

    const fragmentoSecao = criarSecaoDeCategoria(categoria, produtosDaCategoria, templateCategoria);
    container.appendChild(fragmentoSecao);

    // Após anexar, a seção já é um elemento real no DOM (o fragmento é "esvaziado" ao ser inserido)
    iniciarCarrossel(container.lastElementChild);
  });
}

function criarSecaoDeCategoria(categoria, produtosDaCategoria, templateCategoria) {
  const fragmento = templateCategoria.content.cloneNode(true);
  const secao = fragmento.querySelector(".categoria-secao");

  secao.id = `categoria-${categoria.id}`;
  secao.dataset.categoria = categoria.id;
  fragmento.querySelector(".categoria-titulo").textContent = categoria.nome;
  fragmento.querySelector(".categoria-contagem").textContent =
    `${produtosDaCategoria.length} ${produtosDaCategoria.length === 1 ? "item" : "itens"}`;

  preencherBanner(fragmento, categoria);
  preencherGradeDeProdutos(fragmento, produtosDaCategoria, categoria);

  return fragmento;
}

function preencherBanner(fragmento, categoria) {
  const wrapperSlides = fragmento.querySelector(".swiper-wrapper");
  const templateSlide = document.getElementById("template-banner-slide");
  const banners = categoria.banners?.length ? categoria.banners : [IMAGEM_BANNER_PADRAO];

  banners.forEach((caminhoImagem) => {
    const slide = templateSlide.content.cloneNode(true);
    const imagem = slide.querySelector("img");
    imagem.src = caminhoImagem;
    imagem.alt = `Banner - ${categoria.nome}`;
    imagem.onerror = () => (imagem.src = IMAGEM_BANNER_PADRAO);
    wrapperSlides.appendChild(slide);
  });
}

function preencherGradeDeProdutos(fragmento, produtosDaCategoria, categoria) {
  const grade = fragmento.querySelector(".produtos-grid");
  const templateProduto = document.getElementById("template-produto-card");

  produtosDaCategoria.forEach((produto) => {
    const card = templateProduto.content.cloneNode(true);
    const imagem = card.querySelector(".produto-imagem");

    imagem.src = produto.imagem;
    imagem.alt = produto.nome;
    imagem.onerror = () => (imagem.src = IMAGEM_PADRAO);

    card.querySelector(".produto-categoria").textContent = categoria.nome;
    card.querySelector(".produto-nome").textContent = produto.nome;
    card.querySelector(".produto-descricao").textContent = produto.descricao || "";
    card.querySelector(".produto-preco").textContent = formatoMoeda.format(produto.preco);
    card.querySelector(".produto-detalhes-botao").addEventListener("click", () => {
      abrirModalProduto(produto, categoria);
    });

    grade.appendChild(card);
  });
}

/* =========================================================
   MODAL DE DETALHES DO PRODUTO
   ========================================================= */
function iniciarModalProduto() {
  const modal = document.getElementById("modal-produto");
  const botaoFechar = document.getElementById("modal-produto-fechar");

  botaoFechar.addEventListener("click", fecharModalProduto);
  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) fecharModalProduto();
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !modal.hidden) fecharModalProduto();
  });
}

function abrirModalProduto(produto, categoria) {
  const modal = document.getElementById("modal-produto");
  const imagem = document.getElementById("modal-produto-imagem");
  const descricao = produto.descricaoCompleta || produto.descricao || "Descrição não disponível.";

  imagem.src = produto.imagem;
  imagem.alt = produto.nome;
  imagem.onerror = () => (imagem.src = IMAGEM_PADRAO);
  document.getElementById("modal-produto-categoria").textContent = categoria.nome;
  document.getElementById("modal-produto-titulo").textContent = produto.nome;
  document.getElementById("modal-produto-descricao").textContent = descricao;
  document.getElementById("modal-produto-preco").textContent = formatoMoeda.format(produto.preco);

  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-aberto");
  document.getElementById("modal-produto-fechar").focus();
}

function fecharModalProduto() {
  const modal = document.getElementById("modal-produto");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-aberto");
}

/* =========================================================
   MODAL SOBRE NÓS
   ========================================================= */
function iniciarModalSobreNos() {
  const modal = document.getElementById("modal-sobre-nos");
  const botoesAbrir = document.querySelectorAll(".abrir-sobre-nos");
  const botaoFechar = document.getElementById("modal-sobre-nos-fechar");

  if (!modal || !botoesAbrir.length || !botaoFechar) return;

  botoesAbrir.forEach((botao) => botao.addEventListener("click", abrirModalSobreNos));
  botaoFechar.addEventListener("click", fecharModalSobreNos);
  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) fecharModalSobreNos();
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !modal.hidden) fecharModalSobreNos();
  });
}

function abrirModalSobreNos() {
  const modal = document.getElementById("modal-sobre-nos");
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-aberto");
  document.getElementById("modal-sobre-nos-fechar").focus();
}

function fecharModalSobreNos() {
  const modal = document.getElementById("modal-sobre-nos");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-aberto");
}

/* =========================================================
   CARROSSEL DO BANNER (autoplay + setas + dots + arraste)
   ========================================================= */
function iniciarCarrossel(secaoElemento) {
  const elementoSwiper = secaoElemento.querySelector(".banner-swiper");
  if (!elementoSwiper) return;

  const wrapper = elementoSwiper.querySelector(".swiper-wrapper");
  const slides = Array.from(wrapper.querySelectorAll(".swiper-slide"));
  const botaoAnterior = elementoSwiper.querySelector(".swiper-button-prev");
  const botaoProximo = elementoSwiper.querySelector(".swiper-button-next");
  const paginacao = elementoSwiper.querySelector(".swiper-pagination");
  const quantidadeSlides = elementoSwiper.querySelectorAll(".swiper-slide").length;
  if (quantidadeSlides <= 1) {
    botaoAnterior.hidden = true;
    botaoProximo.hidden = true;
    paginacao.hidden = true;
    return;
  }

  let indiceAtual = 0;
  let intervalo;
  let inicioDoArraste = null;
  let ultimoGesto = 0;

  slides.forEach((slide, indice) => {
    slide.setAttribute("aria-hidden", String(indice !== indiceAtual));
  });

  slides.forEach((_, indice) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "swiper-pagination-bullet";
    dot.setAttribute("aria-label", `Ir para o banner ${indice + 1}`);
    dot.addEventListener("click", () => irParaSlide(indice));
    paginacao.appendChild(dot);
  });

  function atualizarCarrossel() {
    wrapper.style.transform = `translate3d(-${indiceAtual * 100}%, 0, 0)`;
    slides.forEach((slide, indice) => {
      slide.setAttribute("aria-hidden", String(indice !== indiceAtual));
    });
    paginacao.querySelectorAll(".swiper-pagination-bullet").forEach((dot, indice) => {
      dot.classList.toggle("swiper-pagination-bullet-active", indice === indiceAtual);
      dot.setAttribute("aria-current", indice === indiceAtual ? "true" : "false");
    });
  }

  function irParaSlide(novoIndice) {
    indiceAtual = (novoIndice + quantidadeSlides) % quantidadeSlides;
    atualizarCarrossel();
    reiniciarAutoplay();
  }

  function reiniciarAutoplay() {
    clearInterval(intervalo);
    intervalo = setInterval(() => {
      indiceAtual = (indiceAtual + 1) % quantidadeSlides;
      atualizarCarrossel();
    }, 4500);
  }

  botaoAnterior.addEventListener("click", () => irParaSlide(indiceAtual - 1));
  botaoProximo.addEventListener("click", () => irParaSlide(indiceAtual + 1));

  function finalizarArraste(posicaoFinal) {
    if (inicioDoArraste === null) return;
    const deslocamento = posicaoFinal - inicioDoArraste;
    inicioDoArraste = null;
    wrapper.classList.remove("arrastando");
    if (Math.abs(deslocamento) < 40 || Date.now() - ultimoGesto < 250) return;
    ultimoGesto = Date.now();
    irParaSlide(indiceAtual + (deslocamento < 0 ? 1 : -1));
  }

  wrapper.addEventListener("pointerdown", (evento) => {
    if (evento.pointerType === "touch") return;
    inicioDoArraste = evento.clientX;
    wrapper.classList.add("arrastando");
    wrapper.setPointerCapture?.(evento.pointerId);
  });

  wrapper.addEventListener("pointerup", (evento) => {
    if (evento.pointerType === "touch") return;
    finalizarArraste(evento.clientX);
  });

  wrapper.addEventListener("pointercancel", () => {
    inicioDoArraste = null;
    wrapper.classList.remove("arrastando");
  });

  wrapper.addEventListener("touchstart", (evento) => {
    inicioDoArraste = evento.touches[0].clientX;
    wrapper.classList.add("arrastando");
  }, { passive: true });

  wrapper.addEventListener("touchend", (evento) => {
    finalizarArraste(evento.changedTouches[0].clientX);
  }, { passive: true });

  atualizarCarrossel();
  reiniciarAutoplay();
}
