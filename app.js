const root = new URL(".", document.currentScript.src);
const directoryMode = document.body.dataset.mode === "directory";
let currentPage = Number(document.body.dataset.page || 1) - 1;
let progressFrame;

const pages = [
  ["layers/first-layer/01-surface.html", "Surface"],
  ["layers/first-layer/02-light.html", "Light"],
  ["layers/first-layer/03-reef.html", "Reef"],
  ["layers/second-layer/04-twilight.html", "Twilight"],
  ["layers/second-layer/05-pressure.html", "Pressure"],
  ["layers/second-layer/06-glow.html", "Glow"],
  ["layers/third-layer/07-descent.html", "Descent"],
  ["layers/third-layer/08-adapt.html", "Adapt"],
  ["layers/third-layer/09-snow.html", "Marine snow"],
  ["layers/fourth-layer/10-abyss.html", "Abyss"],
  ["layers/fourth-layer/11-vents.html", "Vents"],
  ["layers/fourth-layer/12-gate.html", "Explore"],
];

const chapters = [
  ["I", "Sunlit layer"],
  ["II", "Twilight layer"],
  ["III", "Midnight layer"],
  ["IV", "Abyssal layer"],
];

function twoDigits(index) {
  return String(index + 1).padStart(2, "0");
}

function pageUrl(index) {
  return new URL(pages[index][0], root).href;
}

function summaryUrl(index) {
  return new URL(`index.html#summary-${index + 1}`, root).href;
}

function menuUrl(index) {
  return directoryMode ? `#summary-${index + 1}` : pageUrl(index);
}

function createMenu() {
  return chapters
    .map(([number, title], chapterIndex) => {
      const firstPage = chapterIndex * 3;
      const links = pages
        .slice(firstPage, firstPage + 3)
        .map((page, index) => {
          const pageIndex = firstPage + index;
          return `
            <a href="${menuUrl(pageIndex)}" data-index="${pageIndex}" class="menu-link flex justify-between py-2 text-xs text-paper/60 hover:text-signal">
              <span>${twoDigits(pageIndex)}</span>
              <span>${page[1]}</span>
            </a>
          `;
        })
        .join("");

      return `
        <section class="border-t border-paper/20 last:border-b">
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

function createShell() {
  const homeLink = directoryMode ? "#home" : summaryUrl(currentPage);
  const homeLabel = directoryMode ? "OCEAN DEPTHS" : "DIRECTORY";

  document.body.insertAdjacentHTML(
    "afterbegin",
    `
      <a id="skip-link" href="${directoryMode ? "#summary-1" : `#page-${currentPage + 1}`}" class="fixed left-4 top-0 z-50 -translate-y-full bg-signal px-4 py-3 text-xs text-ink focus:translate-y-0">Skip to content</a>

      <header class="fixed left-0 top-0 z-40 flex min-h-16 w-full border-b border-paper/20 bg-ink/90">
        <a id="directory-link" href="${homeLink}" class="flex min-w-36 items-center gap-3 border-r border-paper/20 px-4 text-xs md:px-8">
          <span class="size-2.5 rounded-full border border-signal"></span>
          <span>${homeLabel}</span>
        </a>
        <div class="hidden flex-1 items-center justify-between px-8 text-xs text-paper/60 sm:flex">
          <span id="chapter-status">${directoryMode ? "INTRODUCTION" : "LAYER VIEW"}</span>
          <span id="page-status">${directoryMode ? "HOME" : `${twoDigits(currentPage)} / 12`}</span>
        </div>
        <button id="menu-button" class="ml-auto flex min-w-28 items-center justify-center gap-4 border-l border-paper/20 px-4 text-xs hover:bg-paper/10" type="button" aria-expanded="false" aria-controls="site-menu">
          <span class="menu-label">INDEX</span>
          <span class="grid gap-1" aria-hidden="true">
            <span class="h-px w-6 bg-current"></span>
            <span class="h-px w-6 bg-current"></span>
            <span class="h-px w-6 bg-current"></span>
          </span>
        </button>
      </header>

      <nav id="site-menu" class="fixed inset-y-0 right-0 z-30 w-full max-w-lg overflow-y-auto border-l border-signal/30 bg-[#03151d] px-6 pb-8 pt-24 shadow-2xl md:px-10" aria-label="Page menu" hidden>
        <div class="mb-8 flex justify-between text-xs text-paper/60">
          <span>PAGE MENU</span>
          <span>12 PAGES / 4 LAYERS</span>
        </div>
        ${createMenu()}
      </nav>
    `,
  );
}

function createProgress() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
      <div class="directory-progress pointer-events-none fixed bottom-0 left-[7%] top-16 z-20 opacity-0 md:left-1/4" aria-hidden="true">
        <div class="absolute inset-y-0 w-px bg-paper/25"></div>
        <div class="progress-fill absolute inset-y-0 w-px origin-top bg-signal"></div>
        <div class="progress-marker absolute top-0 grid h-8 w-16 place-items-center border border-signal bg-[#061820] text-[9px] text-signal">
          <span id="depth-status">01 / 12</span>
        </div>
      </div>
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

function updateMenu(index) {
  const chapterIndex = Math.floor(index / 3);
  currentPage = index;

  if (!directoryMode) document.querySelector("#directory-link").href = summaryUrl(index);
  document.querySelector("#chapter-status").textContent =
    `${chapters[chapterIndex][0]} / ${chapters[chapterIndex][1].toUpperCase()}`;
  document.querySelector("#page-status").textContent = `${twoDigits(index)} / 12`;

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
}

function updateProgress() {
  const firstSection = document.querySelector("#summary-1");
  const lastSection = document.querySelector("#summary-12");
  const fill = document.querySelector(".progress-fill");
  const marker = document.querySelector(".progress-marker");
  const progressRail = document.querySelector(".directory-progress");

  if (!firstSection || !lastSection || !fill || !marker || !progressRail) return;

  const start = firstSection.offsetTop;
  const end = lastSection.offsetTop + lastSection.offsetHeight - window.innerHeight;
  const progress = Math.min(Math.max((window.scrollY - start) / Math.max(end - start, 1), 0), 1);
  const markerDistance = Math.max(window.innerHeight - 112, 0);

  progressRail.classList.toggle("opacity-0", window.scrollY < start - 1);
  fill.style.transform = `scaleY(${progress})`;
  marker.style.transform = `translate(-50%, ${16 + progress * markerDistance}px)`;
}

function requestProgressUpdate() {
  if (progressFrame) return;
  progressFrame = requestAnimationFrame(() => {
    updateProgress();
    progressFrame = null;
  });
}

function observeDirectory() {
  const observer = new IntersectionObserver(
    (entries) => {
      const active = entries.find((entry) => entry.isIntersecting);
      if (!active) return;
      const index = Number(active.target.dataset.summary) - 1;
      updateMenu(index);
      document.querySelector("#depth-status").textContent = `${twoDigits(index)} / 12`;
    },
    { threshold: 0.5 },
  );

  document.querySelectorAll(".directory-page").forEach((section) => observer.observe(section));
}

function createExitSection(layerEnd) {
  const nextIndex = layerEnd === pages.length - 1 ? layerEnd : layerEnd + 1;
  const action = layerEnd === pages.length - 1 ? "Return to the final directory stop" : "Continue the directory";

  const section = document.createElement("section");
  section.className =
    "layer-exit snap-start relative flex min-h-svh items-center bg-[#02080c] px-6 py-28 sm:px-10 lg:px-16";
  section.innerHTML = `
    <div class="mx-auto w-full max-w-4xl text-center">
      <p class="text-xs uppercase text-coral">Layer complete</p>
      <h2 class="mt-6 text-balance font-display text-5xl sm:text-7xl">${action}</h2>
      <p class="mx-auto mt-6 max-w-2xl text-pretty leading-7 text-paper/60">
        Return to the twelve-part directory, or use the menu to revisit any detailed page.
      </p>
      <a class="mt-10 inline-flex border border-signal px-6 py-4 text-xs uppercase text-signal hover:bg-signal hover:text-ink" href="${summaryUrl(nextIndex)}">
        Go to ${twoDigits(nextIndex)} / 12
      </a>
      <p class="mt-20 text-xs uppercase text-paper/50">Keep scrolling to continue automatically ↓</p>
      <div id="continue-sentinel" class="absolute bottom-0 left-0 h-px w-full" data-url="${summaryUrl(nextIndex)}"></div>
    </div>
  `;
  return section;
}

function prepareSection(section) {
  section.classList.add("snap-start");
  [...section.children]
    .find((child) => child.classList.contains("min-h-svh"))
    ?.classList.add("pt-24");
  return section;
}

async function getPageSection(index) {
  if (index === currentPage) return document.querySelector(".story-page");

  const response = await fetch(pageUrl(index));
  if (!response.ok) throw new Error(`Could not load page ${index + 1}`);

  const html = await response.text();
  const section = new DOMParser().parseFromString(html, "text/html").querySelector(".story-page");
  if (!section) throw new Error(`Page ${index + 1} has no story section`);
  return section;
}

function observeDetailPages() {
  const observer = new IntersectionObserver(
    (entries) => {
      const active = entries.find((entry) => entry.isIntersecting);
      if (!active) return;
      const index = Number(active.target.id.replace("page-", "")) - 1;
      updateMenu(index);
      history.replaceState({ page: index }, "", pageUrl(index));
      document.title = `${twoDigits(index)} ${pages[index][1]} / Ocean Depths`;
    },
    { threshold: 0.5 },
  );

  document.querySelectorAll(".story-page").forEach((section) => observer.observe(section));
}

function observeExit() {
  const sentinel = document.querySelector("#continue-sentinel");
  if (!sentinel) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) window.location.href = sentinel.dataset.url;
    },
    { threshold: 0.5 },
  );
  observer.observe(sentinel);
}

async function loadLayer() {
  const layerStart = Math.floor(currentPage / 3) * 3;
  const layerEnd = layerStart + 2;

  try {
    prepareSection(document.querySelector(".story-page"));
    const sections = await Promise.all(
      [layerStart, layerStart + 1, layerEnd].map(getPageSection),
    );

    sections.forEach(prepareSection);
    document.querySelector("main").replaceChildren(...sections, createExitSection(layerEnd));
    document.querySelector(`#page-${currentPage + 1}`).scrollIntoView();
    requestAnimationFrame(() => document.documentElement.classList.add("scroll-smooth"));

    observeDetailPages();
    observeExit();
  } catch (error) {
    console.error(error);
  }
}

function startDirectory() {
  history.scrollRestoration = "manual";
  createProgress();
  document.querySelectorAll("main > section").forEach((section) => section.classList.add("snap-start"));
  document.documentElement.classList.add("snap-y", "snap-proximity");
  observeDirectory();
  updateProgress();

  const initialSection = location.hash ? document.querySelector(location.hash) : null;
  if (initialSection) initialSection.scrollIntoView();
  requestAnimationFrame(() => document.documentElement.classList.add("scroll-smooth"));

  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate);
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

  const menuLink = event.target.closest(".menu-link");
  if (!menuLink) return;

  const index = Number(menuLink.dataset.index);
  const target = directoryMode
    ? document.querySelector(`#summary-${index + 1}`)
    : document.querySelector(`#page-${index + 1}`);

  if (!target) return;
  event.preventDefault();
  setMenu(false);
  target.scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

createShell();

if (directoryMode) startDirectory();
else {
  updateMenu(currentPage);
  document.documentElement.classList.add("snap-y", "snap-proximity");
  loadLayer();
}
