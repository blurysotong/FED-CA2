const root = new URL(".", document.currentScript.src);
let currentPage = Number(document.body.dataset.page) - 1;
let allPagesLoaded = false;

const pages = [
  ["layers/first-layer/01-surface.html", "Page 01", "01 / 12"],
  ["layers/first-layer/02-light.html", "Page 02", "02 / 12"],
  ["layers/first-layer/03-reef.html", "Page 03", "03 / 12"],
  ["layers/second-layer/04-twilight.html", "Page 04", "04 / 12"],
  ["layers/second-layer/05-pressure.html", "Page 05", "05 / 12"],
  ["layers/second-layer/06-glow.html", "Page 06", "06 / 12"],
  ["layers/third-layer/07-descent.html", "Page 07", "07 / 12"],
  ["layers/third-layer/08-adapt.html", "Page 08", "08 / 12"],
  ["layers/third-layer/09-snow.html", "Page 09", "09 / 12"],
  ["layers/fourth-layer/10-abyss.html", "Page 10", "10 / 12"],
  ["layers/fourth-layer/11-vents.html", "Page 11", "11 / 12"],
  ["layers/fourth-layer/12-gate.html", "Page 12", "12 / 12"],
];

const chapters = [
  ["I", "Part One"],
  ["II", "Part Two"],
  ["III", "Part Three"],
  ["IV", "Part Four"],
];

function pageUrl(index) {
  return new URL(pages[index][0], root).href;
}

function twoDigits(index) {
  return String(index + 1).padStart(2, "0");
}

function createMenu() {
  return chapters
    .map(([number, title], chapterIndex) => {
      const firstPage = chapterIndex * 3;
      const links = pages
        .slice(firstPage, firstPage + 3)
        .map((page, index) => {
          const pageIndex = firstPage + index;
          return `<a href="${pageUrl(pageIndex)}" data-index="${pageIndex}" class="menu-link flex justify-between py-2 text-xs text-paper/60 hover:text-signal"><span>${twoDigits(pageIndex)}</span><span>${page[1]}</span></a>`;
        })
        .join("");

      return `
        <section class="border-t border-white/20 last:border-b">
          <button class="accordion-button flex w-full items-center gap-4 py-5 text-left font-display text-2xl hover:text-signal" type="button" aria-expanded="false">
            <span class="w-8 font-mono text-xs">${number}</span>
            <span class="flex-1">${title}</span>
            <span class="accordion-symbol font-mono text-xs">+</span>
          </button>
          <div class="accordion-panel pb-5 pl-12" hidden>${links}</div>
        </section>
      `;
    })
    .join("");
}

function createSiteShell() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
      <a id="skip-link" href="#page-${currentPage + 1}" class="fixed left-4 top-0 z-[60] -translate-y-full bg-signal px-4 py-3 text-xs text-ink focus:translate-y-0">Skip to this page</a>

      <header class="fixed left-0 top-0 z-50 flex h-16 w-full border-b border-white/20 bg-ink/80 backdrop-blur">
        <a href="${pageUrl(0)}" data-index="0" class="flex w-1/4 min-w-28 items-center gap-3 border-r border-white/20 px-4 text-xs tracking-[0.25em] md:px-10">
          <span class="h-2.5 w-2.5 rounded-full border border-signal shadow-[0_0_12px_#a8ffec]"></span>
          <span>TEMPLATE</span>
        </a>
        <div class="hidden flex-1 items-center justify-between px-8 text-[10px] tracking-widest text-paper/60 sm:flex">
          <span id="chapter-status"></span>
          <span id="page-status"></span>
        </div>
        <button id="menu-button" class="ml-auto flex min-w-28 items-center justify-center gap-4 border-l border-white/20 px-4 text-[10px] tracking-widest hover:bg-white/10" type="button" aria-expanded="false" aria-controls="site-menu">
          <span class="menu-label">INDEX</span>
          <span class="grid gap-1" aria-hidden="true"><span class="h-px w-6 bg-current"></span><span class="h-px w-6 bg-current"></span><span class="h-px w-6 bg-current"></span></span>
        </button>
      </header>

      <nav id="site-menu" class="fixed inset-y-0 right-0 z-40 w-full max-w-lg overflow-y-auto border-l border-signal/30 bg-[#03151d] px-6 pb-8 pt-24 shadow-2xl md:px-10" aria-label="Page menu" hidden>
        <div class="mb-8 flex justify-between text-[10px] tracking-widest text-paper/60">
          <span>PAGE MENU</span>
          <span>12 PAGES / 4 PARTS</span>
        </div>
        ${createMenu()}
      </nav>

      <div class="pointer-events-none fixed bottom-0 left-[7%] top-16 z-30 md:left-1/4" aria-hidden="true">
        <div class="absolute inset-y-0 w-px bg-white/25"></div>
        <div class="progress-fill absolute inset-y-0 w-px origin-top scale-y-0 bg-signal shadow-[0_0_10px_#a8ffec]"></div>
        <div class="progress-marker absolute top-0 grid h-8 w-16 place-items-center border border-signal bg-[#061820] text-[9px] text-signal"><span id="depth-status"></span></div>
      </div>

      <nav id="station-controls" class="fixed bottom-6 right-4 z-30 flex gap-2 text-[10px] tracking-widest" aria-label="Adjacent pages">
        <a id="previous-link" class="border border-white/25 bg-ink/80 px-4 py-3 hover:bg-signal hover:text-ink">↑ PREV</a>
        <a id="next-link" class="border border-white/25 bg-ink/80 px-4 py-3 hover:bg-signal hover:text-ink">NEXT ↓</a>
      </nav>
    `,
  );
}

function setMenu(open) {
  const menu = document.querySelector("#site-menu");
  const button = document.querySelector("#menu-button");
  menu.hidden = !open;
  button.setAttribute("aria-expanded", String(open));
  button.querySelector(".menu-label").textContent = open ? "CLOSE" : "INDEX";
  document.body.classList.toggle("overflow-hidden", open);
}

function toggleAccordion(button) {
  const panel = button.nextElementSibling;
  const open = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(open));
  button.querySelector(".accordion-symbol").textContent = open ? "−" : "+";
  panel.hidden = !open;
}

function updateShell(index) {
  if (index < 0 || index >= pages.length) return;
  currentPage = index;
  const chapterIndex = Math.floor(index / 3);
  const previousIndex = Math.max(0, index - 1);
  const nextIndex = index === pages.length - 1 ? 0 : index + 1;

  document.body.dataset.page = String(index + 1);
  document.title = `${pages[index][1]} / Template`;
  document.querySelector("#chapter-status").textContent = `${chapters[chapterIndex][0]} / ${chapters[chapterIndex][1].toUpperCase()}`;
  document.querySelector("#page-status").textContent = `${twoDigits(index)}—12`;
  document.querySelector("#depth-status").textContent = pages[index][2];
  document.querySelector("#skip-link").href = `#page-${index + 1}`;

  document.querySelectorAll(".menu-link").forEach((link) => {
    const active = Number(link.dataset.index) === index;
    link.classList.toggle("text-signal", active);
    link.classList.toggle("text-paper/60", !active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  document.querySelectorAll(".accordion-button").forEach((button, buttonIndex) => {
    const open = buttonIndex === chapterIndex;
    button.setAttribute("aria-expanded", String(open));
    button.querySelector(".accordion-symbol").textContent = open ? "−" : "+";
    button.nextElementSibling.hidden = !open;
  });

  const previousLink = document.querySelector("#previous-link");
  previousLink.href = pageUrl(previousIndex);
  previousLink.dataset.index = previousIndex;
  previousLink.classList.toggle("pointer-events-none", index === 0);
  previousLink.classList.toggle("opacity-25", index === 0);

  const nextLink = document.querySelector("#next-link");
  nextLink.href = pageUrl(nextIndex);
  nextLink.dataset.index = nextIndex;
  nextLink.textContent = index === pages.length - 1 ? "SURFACE ↑" : "NEXT ↓";
  document.querySelector("#station-controls").classList.toggle("bottom-24", index === pages.length - 1);
  document.querySelector("#station-controls").classList.toggle("bottom-6", index !== pages.length - 1);
}

let progressFrame;

function updateProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const markerDistance = Math.max(window.innerHeight - 112, 0);

  document.querySelector(".progress-fill").style.transform = `scaleY(${progress})`;
  document.querySelector(".progress-marker").style.transform =
    `translate(-50%, ${16 + progress * markerDistance}px)`;
  progressFrame = null;
}

function requestProgressUpdate() {
  if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
}

function scrollToPage(index, addHistory = true) {
  const section = document.querySelector(`#page-${index + 1}`);
  if (!section) {
    window.location.href = pageUrl(index);
    return;
  }

  setMenu(false);
  section.scrollIntoView({ behavior: "smooth" });
  if (addHistory) history.pushState({ page: index }, "", pageUrl(index));
}

function observePages() {
  const observer = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries.find((entry) => entry.isIntersecting);
      if (!activeEntry) return;
      const index = Number(activeEntry.target.id.replace("page-", "")) - 1;
      updateShell(index);
      history.replaceState({ page: index }, "", pageUrl(index));
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );

  document.querySelectorAll(".story-page").forEach((section) => observer.observe(section));
}

async function loadAllPages() {
  try {
    const sections = await Promise.all(
      pages.map(async (_, index) => {
        if (index === currentPage) return document.querySelector(".story-page");
        const response = await fetch(pageUrl(index));
        const html = await response.text();
        return new DOMParser().parseFromString(html, "text/html").querySelector(".story-page");
      }),
    );

    sections.forEach((section) => section.classList.add("snap-start"));
    document.querySelector("main").replaceChildren(...sections);
    document.documentElement.classList.add("snap-y", "snap-proximity");

    document.querySelector(`#page-${currentPage + 1}`).scrollIntoView();
    requestAnimationFrame(() => document.documentElement.classList.add("scroll-smooth"));

    allPagesLoaded = true;
    observePages();
    updateProgress();
  } catch {
    allPagesLoaded = false;
  }
}

document.addEventListener("click", (event) => {
  if (event.target.closest("#menu-button")) {
    const open = document.querySelector("#menu-button").getAttribute("aria-expanded") !== "true";
    setMenu(open);
    return;
  }

  const accordionButton = event.target.closest(".accordion-button");
  if (accordionButton) {
    toggleAccordion(accordionButton);
    return;
  }

  if (event.target.closest("#open-index")) {
    setMenu(true);
    return;
  }

  const link = event.target.closest("a");
  if (!link || !allPagesLoaded) return;
  const index = pages.findIndex((_, pageIndex) => new URL(link.href).pathname === new URL(pageUrl(pageIndex)).pathname);
  if (index < 0) return;

  event.preventDefault();
  scrollToPage(index);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener("popstate", (event) => {
  const index = event.state?.page;
  if (Number.isInteger(index)) scrollToPage(index, false);
});

window.addEventListener("scroll", requestProgressUpdate, { passive: true });
window.addEventListener("resize", requestProgressUpdate);

createSiteShell();
updateShell(currentPage);
loadAllPages();
