const root = new URL(".", document.currentScript.src);
const directoryMode = document.body.dataset.mode === "directory";
let currentPage = Number(document.body.dataset.page || 1) - 1;
let progressFrame;

const pages = [
  ["layers/first-layer/01-surface.html", "Sunlight Zone"],
  ["layers/first-layer/02-life.html", "Life & food web"],
  ["layers/first-layer/03-impact.html", "People & impact"],
  ["layers/second-layer/04-twilight.html", "Twilight"],
  ["layers/second-layer/05-pressure.html", "Plastic snow"],
  ["layers/second-layer/06-glow.html", "Twilight life"],
  ["layers/third-layer/07-descent.html", "Descent"],
  ["layers/third-layer/08-lures.html", "Lures"],
  ["layers/third-layer/09-sightings.html", "Sightings"],
  ["layers/fourth-layer/10-abyss.html", "Welcome to the Abyss"],
  ["layers/fourth-layer/11-marine-snow.html", "The long fall"],
  ["layers/fourth-layer/12-locals.html", "Life in the void"],
];

const chapters = [
  ["I", "Sunlit layer"],
  ["II", "Twilight layer"],
  ["III", "Midnight layer"],
  ["IV", "Abyssal layer"],
];

const depthStops = [0, 200, 1000, 4000, 6000];
const researchSubDepth = 3346;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let cancelProgressVehicleTransition;

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
      <div class="directory-progress pointer-events-none fixed bottom-0 top-16 z-20 w-16 -translate-x-1/2 opacity-0" aria-hidden="true">
        <div class="absolute inset-y-0 left-1/2 w-px bg-paper/25"></div>
        <div class="progress-fill absolute inset-y-0 left-1/2 w-px origin-top bg-signal"></div>
        <div class="progress-marker absolute left-1/2 top-0 text-signal" data-vehicle="experimental">
          <span class="progress-vehicle" aria-hidden="true">
            <svg class="progress-sub progress-sub-experimental" viewBox="0 0 170 72">
              <path class="progress-sub-hull" d="M42 18h65c16 0 28 6 35 17-7 11-19 17-35 17H42Z" />
              <path class="progress-sub-fairing" d="M94 14h58l-9 12h10l-23 23h-25c9-7 14-18 12-35Z" />
              <path class="progress-sub-cap" d="M42 18c-14 0-24 7-24 17s10 17 24 17Z" />
              <path d="M42 16v38M47 18v34M18 25 10 29v12l8 4M10 29c-5 2-5 10 0 12" />
              <ellipse class="progress-sub-viewport" cx="11" cy="35" rx="4" ry="5" />
              <path d="M82 18V9h14v9M80 9h18M89 9V5M126 47h17v9h-17M129 50h11M116 18h18" />
              <path d="M15 55h143v13H15ZM24 55l13-6M149 55l-14-7M41 55v13M132 55v13M15 62h143" />
              <path class="progress-sub-detail" d="M50 23h47M50 47h47M106 19c6 9 6 23 0 32" />
              <text class="progress-sub-name" x="74" y="30" text-anchor="middle">OCEANGATE TITAN</text>
              <text class="progress-depth-readout" x="74" y="43" text-anchor="middle">0 m</text>
            </svg>
            <svg class="progress-sub progress-sub-research" viewBox="0 0 120 50">
              <path d="M11 31c0-11 8-20 20-20 8 0 14 4 18 10h43l18 9-18 9H45c-4 4-9 6-15 6-11 0-19-5-19-14Z" />
              <path d="M12 42 8 47h94M26 44v3M87 39v8M63 21V9h12M94 35l15 11M106 30h9" />
              <circle cx="27" cy="25" r="5" />
              <text class="progress-depth-readout" x="70" y="33" text-anchor="middle">0 m</text>
            </svg>
            <span class="progress-pressure-flash"></span>
          </span>
          <span class="progress-vehicle-label">OceanGate Titan</span>
        </div>
        <input class="progress-control absolute inset-0 z-10 h-full w-full opacity-0" type="range" min="0" max="100" step="1" value="0" aria-label="Directory depth" aria-valuetext="0 metres" tabindex="-1" />
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

function getProgressMetrics() {
  const firstSection = document.querySelector("#summary-1");
  const lastSection = document.querySelector("#summary-12");
  const depthSections = [1, 4, 7, 10].map((index) =>
    document.querySelector(`#summary-${index}`),
  );
  if (!firstSection || !lastSection || depthSections.some((section) => !section)) {
    return null;
  }

  const start = firstSection.offsetTop;
  const end = lastSection.offsetTop + lastSection.offsetHeight - window.innerHeight;
  return {
    start,
    distance: Math.max(end - start, 1),
    depthAnchors: [...depthSections.map((section) => section.offsetTop), end],
  };
}

function clampProgress(progress) {
  return Math.min(Math.max(progress, 0), 1);
}

function depthAtPosition(position, anchors) {
  const nextAnchor = anchors.findIndex((anchor) => position < anchor);
  const segment =
    nextAnchor === -1 ? depthStops.length - 2 : Math.max(nextAnchor - 1, 0);
  const segmentProgress = clampProgress(
    (position - anchors[segment]) / Math.max(anchors[segment + 1] - anchors[segment], 1),
  );
  const depth =
    depthStops[segment] +
    segmentProgress * (depthStops[segment + 1] - depthStops[segment]);
  return Math.round(depth);
}

function setProgressVehicle(marker, vehicle) {
  if (marker.dataset.vehicle === vehicle) return;
  marker.dataset.vehicle = vehicle;
  marker.querySelector(".progress-vehicle-label").textContent =
    vehicle === "research" ? "research sub" : "OceanGate Titan";
}

function stopProgressVehicleTransition(marker) {
  cancelProgressVehicleTransition?.();
  cancelProgressVehicleTransition = undefined;
  delete marker.dataset.transition;
}

function startProgressVehicleTransition(marker) {
  if (reducedMotion.matches) {
    setProgressVehicle(marker, "research");
    return;
  }

  const experimentalSub = marker.querySelector(".progress-sub-experimental");
  marker.dataset.transition = "imploding";

  const finishTransition = () => {
    delete marker.dataset.transition;
    setProgressVehicle(marker, "research");
    cancelProgressVehicleTransition = undefined;
    requestProgressUpdate();
  };

  experimentalSub.addEventListener("animationend", finishTransition, { once: true });
  cancelProgressVehicleTransition = () => {
    experimentalSub.removeEventListener("animationend", finishTransition);
  };
}

function updateProgressVehicle(marker, depth) {
  const beyondExperimentalLimit = depth >= researchSubDepth;

  if (!beyondExperimentalLimit) {
    stopProgressVehicleTransition(marker);
    setProgressVehicle(marker, "experimental");
    return;
  }

  if (marker.dataset.vehicle === "research" || marker.dataset.transition) return;
  startProgressVehicleTransition(marker);
}

function updateProgress() {
  const fill = document.querySelector(".progress-fill");
  const marker = document.querySelector(".progress-marker");
  const progressRail = document.querySelector(".directory-progress");
  const progressControl = document.querySelector(".progress-control");
  const metrics = getProgressMetrics();

  if (!metrics || !fill || !marker || !progressRail || !progressControl) return;

  const progress = clampProgress((window.scrollY - metrics.start) / metrics.distance);
  const depth = depthAtPosition(window.scrollY, metrics.depthAnchors);
  const markerDistance = Math.max(progressRail.offsetHeight - marker.offsetHeight, 0);
  const visible = window.scrollY >= metrics.start - 1;

  progressRail.classList.toggle("opacity-0", !visible);
  progressRail.classList.toggle("pointer-events-none", !visible);
  progressControl.tabIndex = visible ? 0 : -1;
  progressRail.setAttribute("aria-hidden", String(!visible));
  if (!progressControl.matches(":active")) {
    progressControl.value = String(Math.round(progress * 100));
  }
  updateProgressVehicle(marker, depth);
  const displayedDepth = marker.dataset.transition ? researchSubDepth : depth;
  const formattedDepth = displayedDepth.toLocaleString();
  document.querySelectorAll(".progress-depth-readout").forEach((readout) => {
    readout.textContent = `${formattedDepth} m`;
  });
  const vehicleDescription = marker.dataset.transition
    ? "OceanGate Titan submersible implosion"
    : marker.dataset.vehicle === "research"
      ? "research submersible"
      : "OceanGate Titan submersible";
  progressControl.setAttribute(
    "aria-valuetext",
    `${formattedDepth} metres, ${vehicleDescription}`,
  );
  fill.style.transform = `scaleY(${progress})`;
  marker.style.setProperty("--marker-y", `${progress * markerDistance}px`);
}

function scrollToProgress(progress, behavior = "auto") {
  const metrics = getProgressMetrics();
  if (!metrics) return;

  window.scrollTo({
    top: metrics.start + clampProgress(progress) * metrics.distance,
    behavior,
  });
}

function enableProgressNavigation() {
  const progressControl = document.querySelector(".progress-control");
  if (!progressControl) return;

  progressControl.addEventListener("input", () => {
    scrollToProgress(progressControl.valueAsNumber / 100, "smooth");
  });
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
    { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
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
    document.dispatchEvent(
      new CustomEvent("ocean:layer-ready", { detail: { layerStart, layerEnd } }),
    );
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
  enableProgressNavigation();
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
