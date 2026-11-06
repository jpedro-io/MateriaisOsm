"use strict";

/* Melhorias de interface: entrada em sequência, fundo vivo, cabeçalho reativo,
   barra de leitura, brilho que segue o ponteiro, seção atual na navegação,
   retorno do download e cópia do link.
   A página funciona por inteiro sem este arquivo. */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

/* ---------- entrada em sequência ---------- */

function initScrollReveal() {
  const targets = [...document.querySelectorAll("[data-reveal]")];
  if (!targets.length) return;

  if (!("IntersectionObserver" in window) || reduceMotion.matches) {
    targets.forEach((target) => target.classList.add("reveal-visible"));
    return;
  }

  /* os 10 blocos entram em cascata, 40 ms entre um e outro */
  document.querySelectorAll(".block-grid > li").forEach((card, indice) => {
    card.style.setProperty("--reveal-delay", indice * 40 + "ms");
  });

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove("reveal-pending");
      entry.target.classList.add("reveal-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  targets.forEach((target) => {
    target.classList.add("reveal-pending");
    observer.observe(target);
  });
}

/* ---------- cabeçalho reativo ---------- */

function initHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let agendado = false;

  const atualizar = () => {
    agendado = false;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  window.addEventListener("scroll", () => {
    if (agendado) return;
    agendado = true;
    window.requestAnimationFrame(atualizar);
  }, { passive: true });

  atualizar();
}

/* ---------- barra de progresso da leitura ---------- */

function initReadProgress() {
  const barra = document.querySelector(".read-progress > span");
  if (!barra) return;

  let agendado = false;

  const atualizar = () => {
    agendado = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const lido = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    barra.style.transform = "scaleX(" + lido.toFixed(4) + ")";
  };

  window.addEventListener("scroll", () => {
    if (agendado) return;
    agendado = true;
    window.requestAnimationFrame(atualizar);
  }, { passive: true });
  window.addEventListener("resize", atualizar);
  atualizar();
}

/* ---------- fundo vivo: pausa com a aba oculta ---------- */

function initBackdrop() {
  const fundo = document.querySelector(".backdrop");
  if (!fundo) return;

  const ajustar = () => {
    fundo.classList.toggle("is-paused", document.hidden || reduceMotion.matches);
  };

  document.addEventListener("visibilitychange", ajustar);
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", ajustar);
  }
  ajustar();
}

/* ---------- brilho que segue o ponteiro (só desktop) ---------- */

function initPointerGlow() {
  if (!finePointer.matches || reduceMotion.matches) return;

  const paineis = [...document.querySelectorAll(".band-inner, .block-card, .file-card, .card-figure")];
  if (!paineis.length) return;

  paineis.forEach((painel) => {
    painel.classList.add("has-glow");
    painel.addEventListener("pointermove", (evento) => {
      const caixa = painel.getBoundingClientRect();
      painel.style.setProperty("--mx", evento.clientX - caixa.left + "px");
      painel.style.setProperty("--my", evento.clientY - caixa.top + "px");
      painel.classList.add("is-lit");
    }, { passive: true });

    painel.addEventListener("pointerleave", () => {
      painel.classList.remove("is-lit");
    });
  });
}

/* ---------- seção atual na navegação + indicador deslizante ---------- */

function initCurrentSection() {
  const nav = document.querySelector(".section-nav");
  const links = [...document.querySelectorAll(".section-nav a")];
  if (!nav || !links.length) return;

  const indicador = nav.querySelector(".nav-indicator");

  const sections = links
    .map((link) => {
      const alvo = document.querySelector(link.getAttribute("href"));
      return alvo ? { id: alvo.id, el: alvo, link } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const setCurrent = (id) => {
    sections.forEach(({ id: secao, link }) => {
      const ativo = secao === id;
      link.classList.toggle("is-current", ativo);
      if (ativo) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const moverIndicador = (link) => {
    if (!indicador) return;
    if (!link) {
      indicador.classList.remove("is-visible");
      return;
    }
    indicador.classList.add("is-visible");
    indicador.style.width = link.offsetWidth + "px";
    indicador.style.transform = "translateX(" + link.offsetLeft + "px)";
  };

  let agendado = false;

  const atualizar = () => {
    agendado = false;
    const limite = window.scrollY + 140;
    let atual = null;

    sections.forEach(({ id, el }) => {
      if (el.getBoundingClientRect().top + window.scrollY <= limite) atual = id;
    });

    setCurrent(atual);
    moverIndicador(sections.find((secao) => secao.id === atual)?.link);
  };

  const agendar = () => {
    if (agendado) return;
    agendado = true;
    window.requestAnimationFrame(atualizar);
  };

  window.addEventListener("scroll", agendar, { passive: true });
  window.addEventListener("resize", agendar);
  atualizar();
}

/* ---------- avisos ---------- */

const status = document.querySelector("#download-status");

function announce(message, isError) {
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("is-error", Boolean(isError));
  window.clearTimeout(announce.timer);
  announce.timer = window.setTimeout(() => {
    status.textContent = "";
    status.classList.remove("is-error");
  }, 7000);
}

function initDownloadFeedback() {
  const buttons = [...document.querySelectorAll("[data-download]")];
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const nome = button.dataset.downloadNome
        || button.closest("article")?.querySelector("h3")?.textContent?.trim()
        || "arquivo";

      button.setAttribute("aria-busy", "true");

      window.setTimeout(() => {
        button.removeAttribute("aria-busy");
        announce("Download iniciado: " + nome + ". Se o arquivo não abrir, use o botão Abrir no Drive.");
      }, 400);
    });
  });
}

function initCopyLink() {
  const button = document.querySelector("[data-copiar]");
  if (!button) return;

  button.addEventListener("click", async () => {
    const valor = button.dataset.copiar;

    const confirmar = () => {
      button.classList.add("is-copied");
      window.clearTimeout(confirmar.timer);
      confirmar.timer = window.setTimeout(() => button.classList.remove("is-copied"), 2400);
    };

    try {
      if (!navigator.clipboard) throw new Error("sem clipboard");
      await navigator.clipboard.writeText(valor);
      announce("Link copiado. Cole onde precisar.");
      confirmar();
    } catch {
      announce("Não foi possível copiar aqui. Use o botão Abrir no Drive.", true);
    }
  });
}

initScrollReveal();
initHeaderState();
initReadProgress();
initBackdrop();
initPointerGlow();
initCurrentSection();
initDownloadFeedback();
initCopyLink();
