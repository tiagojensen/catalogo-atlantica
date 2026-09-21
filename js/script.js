/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */
const CAMINHO_PRODUTOS = "dados/produtos.json";
const CAMINHO_CATEGORIAS = "dados/categorias.json";
const CAMINHO_CARROSSEIS = "dados/carrosseis.json";
const IMAGEM_PADRAO = "https://placehold.co/600x600/EFEAE0/9C4A32?text=Sem+imagem";
const IMAGEM_BANNER_PADRAO = "https://placehold.co/1600x600/21261F/EFEAE0?text=Banner";

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function precoDeConsultor(preco) {
  return Number(preco) / 2;
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("ano-atual").textContent = new Date().getFullYear();
  iniciarMenuMobile();
  iniciarDropdowns();
  iniciarModalProduto();
  iniciarModalSobreNos();
  montarConsultorNoAlvo("consultor-inicial", "consultor-inicial", "consultor-inicio-mobile");
  montarConsultorNoAlvo("consultor-final", "consultor-final");

  try {
    const [produtos, categorias, carrosseis] = await Promise.all([
      buscarJSON(CAMINHO_PRODUTOS),
      buscarJSON(CAMINHO_CATEGORIAS),
      buscarJSON(CAMINHO_CARROSSEIS),
    ]);

    montarCarrosseis(carrosseis);
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

function criarSecaoConsultor(id, classesExtras = "") {
  const template = document.getElementById("template-consultor");
  if (!template) return null;

  const secao = template.content.firstElementChild.cloneNode(true);
  secao.id = id;
  if (classesExtras) secao.classList.add(...classesExtras.split(" ").filter(Boolean));
  return secao;
}

function montarConsultorNoAlvo(idAlvo, idSecao, classesExtras = "") {
  const alvo = document.getElementById(idAlvo);
  const secao = criarSecaoConsultor(idSecao, classesExtras);
  if (alvo && secao) alvo.replaceWith(secao);
}

/* =========================================================
   CARROSSÉIS EDITORIAIS REUTILIZÁVEIS
   Os cards e links vêm de dados/carrosseis.json.
   ========================================================= */
function montarCarrosseis(carrosseis) {
  const container = document.getElementById("carrosseis");
  const template = document.getElementById("template-carrossel");
  if (!container || !template) return;

  carrosseis.forEach((configuracao) => {
    if (!configuracao?.itens?.length) return;

    const fragmento = template.content.cloneNode(true);
    const secao = fragmento.querySelector(".protocolos-secao");
    const titulo = secao.querySelector(".protocolos-titulo");
    const descricao = secao.querySelector(".protocolos-descricao");
    const botao = secao.querySelector("[data-carrossel-action]");
    const trilho = secao.querySelector("[data-carrossel-track]");
    const tituloId = `titulo-carrossel-${configuracao.id}`;

    secao.id = `carrossel-${configuracao.id}`;
    secao.setAttribute("aria-labelledby", tituloId);
    secao.querySelector(".secao-eyebrow").textContent = configuracao.eyebrow || "";
    titulo.id = tituloId;
    titulo.textContent = configuracao.titulo || "";
    descricao.textContent = configuracao.descricao || "";

    configuracao.itens.forEach((item) => {
      const card = document.createElement("div");
      const imagem = document.createElement("img");
      const nome = document.createElement("span");

      card.className = "protocolo-card";

      imagem.src = item.imagem;
      imagem.alt = item.alt || item.nome;
      imagem.loading = "lazy";
      imagem.draggable = false;
      imagem.onerror = () => (imagem.src = IMAGEM_PADRAO);

      nome.textContent = item.nome;
      card.append(imagem, nome);
      trilho.appendChild(card);
    });

    if (configuracao.botao?.link) {
      botao.href = configuracao.botao.link;
      botao.textContent = configuracao.botao.texto || "Ver todos";
    } else {
      botao.remove();
    }

    container.appendChild(fragmento);
    iniciarCarrosselEditorial(secao);
  });
}

function iniciarCarrosselEditorial(secao) {
  const viewport = secao.querySelector("[data-carrossel-viewport]");
  const trilho = secao.querySelector("[data-carrossel-track]");
  const paginacao = secao.querySelector("[data-carrossel-pagination]");
  const botaoAnterior = secao.querySelector("[data-carrossel-prev]");
  const botaoProximo = secao.querySelector("[data-carrossel-next]");
  if (!viewport || !trilho || !paginacao) return;

  const originais = Array.from(trilho.querySelectorAll(".protocolo-card"));
  const quantidade = originais.length;
  if (!quantidade) return;

  // Três cópias garantem que sempre exista um item antes e depois do destaque.
  const criarCopia = () => originais.map((card) => card.cloneNode(true));
  trilho.replaceChildren(...criarCopia(), ...criarCopia(), ...criarCopia());
  const cards = Array.from(trilho.querySelectorAll(".protocolo-card"));

  let indiceAtual = quantidade + Math.min(1, quantidade - 1);
  let inicioDoArraste = null;
  let cliqueBloqueado = false;
  let intervaloAutoplay;

  for (let indice = 0; indice < quantidade; indice += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "protocolo-dot";
    dot.setAttribute("aria-label", `Ir para o item ${indice + 1}`);
    dot.addEventListener("click", () => {
      irParaItem(quantidade + indice);
      reiniciarAutoplay();
    });
    paginacao.appendChild(dot);
  }

  function indiceLogico() {
    return ((indiceAtual % quantidade) + quantidade) % quantidade;
  }

  function atualizarCarrossel() {
    // offsetWidth ignora o scale visual e mede o espaço real ocupado no trilho.
    const larguraCard = cards[0].offsetWidth;
    const estilosTrilho = getComputedStyle(trilho);
    const espacamento = parseFloat(estilosTrilho.columnGap || estilosTrilho.gap) || 0;
    const deslocamento = (viewport.clientWidth - larguraCard) / 2 - indiceAtual * (larguraCard + espacamento);

    trilho.style.transform = `translate3d(${deslocamento}px, 0, 0)`;
    cards.forEach((card, indice) => card.classList.toggle("ativo", indice === indiceAtual));
    paginacao.querySelectorAll(".protocolo-dot").forEach((dot, indice) => {
      dot.classList.toggle("ativo", indice === indiceLogico());
      dot.setAttribute("aria-current", indice === indiceLogico() ? "true" : "false");
    });
  }

  function irParaItem(novoIndice) {
    indiceAtual = novoIndice;
    trilho.style.transition = "";
    atualizarCarrossel();
  }

  function reiniciarAutoplay() {
    clearInterval(intervaloAutoplay);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    intervaloAutoplay = setInterval(() => {
      irParaItem(indiceAtual + 1);
    }, 4500);
  }

  trilho.addEventListener("transitionend", (evento) => {
    if (evento.propertyName !== "transform") return;
    if (indiceAtual >= quantidade && indiceAtual < quantidade * 2) return;

    indiceAtual = quantidade + indiceLogico();
    trilho.style.transition = "none";
    atualizarCarrossel();
    void trilho.offsetWidth;
    trilho.style.transition = "";
  });

  botaoAnterior?.addEventListener("click", () => {
    irParaItem(indiceAtual - 1);
    reiniciarAutoplay();
  });
  botaoProximo?.addEventListener("click", () => {
    irParaItem(indiceAtual + 1);
    reiniciarAutoplay();
  });

  secao.addEventListener("mouseenter", () => clearInterval(intervaloAutoplay));
  secao.addEventListener("mouseleave", reiniciarAutoplay);
  secao.addEventListener("focusin", () => clearInterval(intervaloAutoplay));
  secao.addEventListener("focusout", (evento) => {
    if (!secao.contains(evento.relatedTarget)) reiniciarAutoplay();
  });

  viewport.addEventListener("pointerdown", (evento) => {
    clearInterval(intervaloAutoplay);
    inicioDoArraste = evento.clientX;
    trilho.classList.add("arrastando");
    viewport.setPointerCapture?.(evento.pointerId);
  });

  viewport.addEventListener("pointerup", (evento) => {
    if (inicioDoArraste === null) return;
    const deslocamento = evento.clientX - inicioDoArraste;
    inicioDoArraste = null;
    trilho.classList.remove("arrastando");

    if (Math.abs(deslocamento) < 40) {
      reiniciarAutoplay();
      return;
    }
    cliqueBloqueado = true;
    irParaItem(indiceAtual + (deslocamento < 0 ? 1 : -1));
    reiniciarAutoplay();
  });

  viewport.addEventListener("pointercancel", () => {
    inicioDoArraste = null;
    trilho.classList.remove("arrastando");
    reiniciarAutoplay();
  });

  viewport.addEventListener("click", (evento) => {
    if (!cliqueBloqueado) return;
    evento.preventDefault();
    evento.stopPropagation();
    cliqueBloqueado = false;
  }, true);

  window.addEventListener("resize", atualizarCarrossel);
  atualizarCarrossel();
  reiniciarAutoplay();
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
  const templateConsultor = document.getElementById("template-consultor");
  document.getElementById("mensagem-carregando").remove();

  categorias.forEach((categoria) => {
    const produtosDaCategoria = produtos.filter((p) => p.categoria === categoria.id);
    if (produtosDaCategoria.length === 0) return;

    const fragmentoSecao = criarSecaoDeCategoria(categoria, produtosDaCategoria, templateCategoria);
    container.appendChild(fragmentoSecao);

    // Após anexar, a seção já é um elemento real no DOM (o fragmento é "esvaziado" ao ser inserido)
    iniciarCarrossel(container.lastElementChild);

    if (categoria.consultorDepois && templateConsultor) {
      const secaoConsultor = criarSecaoConsultor(
        `consultor-apos-${categoria.id}`,
        "consultor-inicio-mobile"
      );
      if (secaoConsultor) container.appendChild(secaoConsultor);
    }
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

  if (["nutraceuticos", "cosmeticos-ozonizados"].includes(categoria.id)) {
    const acaoCatalogo = document.createElement("div");
    acaoCatalogo.className = "categoria-acao";
    acaoCatalogo.innerHTML = `
      <a class="botao botao-primario" href="arquivos/catalogo_atl_2026.pdf" target="_blank" rel="noopener noreferrer">
        Confira todos os produtos
      </a>
    `;
    secao.appendChild(acaoCatalogo);
  }

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
    card.querySelector(".produto-preco-original").textContent = formatoMoeda.format(produto.preco);
    card.querySelector(".produto-preco-consultor").textContent = formatoMoeda.format(precoDeConsultor(produto.preco));
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
  document.getElementById("modal-produto-preco-original").textContent = formatoMoeda.format(produto.preco);
  document.getElementById("modal-produto-preco").textContent = formatoMoeda.format(precoDeConsultor(produto.preco));

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
  const paginacao = elementoSwiper.querySelector(".swiper-pagination");
  const quantidadeSlides = elementoSwiper.querySelectorAll(".swiper-slide").length;
  if (quantidadeSlides <= 1) {
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

  function finalizarArraste(posicaoFinal) {
    if (inicioDoArraste === null) return;
    const deslocamento = posicaoFinal - inicioDoArraste;
    inicioDoArraste = null;
    wrapper.classList.remove("arrastando");
    if (Math.abs(deslocamento) < 40 || Date.now() - ultimoGesto < 250) return;
    ultimoGesto = Date.now();
    irParaSlide(indiceAtual + (deslocamento < 0 ? 1 : -1));
  }

  // O gesto fica no viewport fixo, e não no wrapper transformado.
  // Assim o segundo banner continua recebendo o gesto para voltar ao primeiro.
  elementoSwiper.addEventListener("pointerdown", (evento) => {
    if (evento.pointerType === "touch") return;
    inicioDoArraste = evento.clientX;
    wrapper.classList.add("arrastando");
    elementoSwiper.setPointerCapture?.(evento.pointerId);
  });

  elementoSwiper.addEventListener("pointerup", (evento) => {
    if (evento.pointerType === "touch") return;
    finalizarArraste(evento.clientX);
  });

  elementoSwiper.addEventListener("pointercancel", () => {
    inicioDoArraste = null;
    wrapper.classList.remove("arrastando");
  });

  elementoSwiper.addEventListener("touchstart", (evento) => {
    inicioDoArraste = evento.touches[0].clientX;
    wrapper.classList.add("arrastando");
  }, { passive: true });

  elementoSwiper.addEventListener("touchend", (evento) => {
    finalizarArraste(evento.changedTouches[0].clientX);
  }, { passive: true });

  elementoSwiper.addEventListener("touchcancel", () => {
    inicioDoArraste = null;
    wrapper.classList.remove("arrastando");
  }, { passive: true });

  atualizarCarrossel();
  reiniciarAutoplay();
}
