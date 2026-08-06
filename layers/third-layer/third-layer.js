const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let audioFadeFrame;

function setSoundState(button, playing) {
  button.setAttribute("aria-pressed", String(playing));
  button.querySelector("[data-sound-label]").textContent = playing
    ? "Mute transmission"
    : "Enable transmission";
}

// Volume is ramped with animation frames so starting and stopping the loop never clicks abruptly.
function fadeAudio(audio, targetVolume, onComplete) {
  cancelAnimationFrame(audioFadeFrame);

  if (prefersReducedMotion.matches) {
    audio.volume = targetVolume;
    onComplete?.();
    return;
  }

  const initialVolume = audio.volume;
  const startedAt = performance.now();
  const duration = 1600;

  function updateVolume(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    audio.volume = initialVolume + (targetVolume - initialVolume) * progress;

    if (progress < 1) audioFadeFrame = requestAnimationFrame(updateVolume);
    else onComplete?.();
  }

  audioFadeFrame = requestAnimationFrame(updateVolume);
}

async function playTransmission(audio, button) {
  try {
    audio.volume = 0;
    await audio.play();
    fadeAudio(audio, 0.28);
    setSoundState(button, true);
  } catch {
    // Browsers normally block audible autoplay until the visitor chooses to start it.
    setSoundState(button, false);
  }
}

function bindSound() {
  const audio = document.querySelector("[data-midnight-audio]");
  const button = document.querySelector("[data-sound-toggle]");
  if (!audio || !button || button.dataset.bound) return;

  button.dataset.bound = "true";
  button.addEventListener("click", async () => {
    if (audio.paused) {
      await playTransmission(audio, button);
      return;
    }

    fadeAudio(audio, 0, () => audio.pause());
    setSoundState(button, false);
  });

  if (!audio.dataset.autoplayAttempted) {
    audio.dataset.autoplayAttempted = "true";
    void playTransmission(audio, button);
  }
}

// The entrance question records only the first normalized, case-insensitive answer.
function bindZoneGuess() {
  const form = document.querySelector("[data-zone-guess]");
  if (!form || form.dataset.bound) return;

  form.dataset.bound = "true";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (form.dataset.attempted) return;

    const input = form.elements.zone;
    const answer = input.value.trim().toLowerCase().replaceAll(/\s+/g, " ");
    const acceptedAnswers = new Set([
      "bathypelagic",
      "bathypelagic zone",
      "midnight",
      "midnight zone",
    ]);
    const correct = acceptedAnswers.has(answer);
    const result = form.querySelector("#zone-result");

    result.textContent = correct
      ? "Correct—how'd you know?"
      : "Wrong, but I don't expect you to know anyway…";
    result.classList.toggle("dive-result-correct", correct);
    result.classList.toggle("dive-result-wrong", !correct);
    form.dataset.attempted = "true";
    input.disabled = true;
    form.querySelector("button").disabled = true;
  });
}

// The range value becomes a CSS variable shared by both specimen image treatments.
function bindNightVision() {
  const stage = document.querySelector("[data-night-vision-stage]");
  const slider = document.querySelector("[data-night-vision]");
  const output = document.querySelector("[data-night-vision-output]");
  if (!stage || !slider || !output || slider.dataset.bound) return;

  slider.dataset.bound = "true";

  function updateNightVision() {
    stage.style.setProperty("--night-vision", String(Number(slider.value) / 100));
    output.value = `${slider.value}%`;
  }

  slider.addEventListener("input", updateNightVision);
  updateNightVision();
}

// Event handlers update one semantic figure for pointer, keyboard, and touch input.
function bindCreatureGallery() {
  const gallery = document.querySelector("[data-creature-gallery]");
  if (!gallery || gallery.dataset.bound) return;

  gallery.dataset.bound = "true";
  const image = gallery.querySelector("[data-creature-image]");
  const name = gallery.querySelector("[data-creature-name]");
  const scientific = gallery.querySelector("[data-creature-scientific]");
  const note = gallery.querySelector("[data-creature-note]");
  const buttons = [...gallery.querySelectorAll("[data-creature-target]")];

  function showCreature(button) {
    if (button.getAttribute("aria-pressed") === "true") return;

    buttons.forEach((candidate) => {
      candidate.setAttribute("aria-pressed", String(candidate === button));
    });

    image.classList.add("opacity-0");
    image.src = button.dataset.image;
    image.alt = button.dataset.alt;
    name.textContent = button.dataset.name;
    scientific.textContent = button.dataset.scientific;
    note.textContent = button.dataset.note;
    requestAnimationFrame(() => image.classList.remove("opacity-0"));
  }

  buttons.forEach((button) => {
    button.addEventListener("pointerenter", () => showCreature(button));
    button.addEventListener("focus", () => showCreature(button));
    button.addEventListener("click", () => showCreature(button));
  });
}

// Answers live on the quiz form so scoring stays scoped to this single component.
function bindQuiz() {
  const form = document.querySelector("[data-depth-quiz]");
  if (!form || form.dataset.bound) return;

  form.dataset.bound = "true";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (form.dataset.complete) return;

    const answers = form.dataset.answers.split(",");
    const selections = [...form.querySelectorAll("fieldset")].map(
      (fieldset) => fieldset.querySelector("input:checked")?.value,
    );
    const score = answers.filter((answer, index) => answer === selections[index]).length;
    const result = form.querySelector("[data-quiz-result]");

    result.value = `${score} / ${answers.length} signals understood.`;
    form.dataset.complete = "true";
    form.querySelectorAll("input, button").forEach((control) => {
      control.disabled = true;
    });
  });
}

function initializeMidnightLayer() {
  bindSound();
  bindZoneGuess();
  bindNightVision();
  bindCreatureGallery();
  bindQuiz();
}

document.addEventListener("DOMContentLoaded", initializeMidnightLayer);
// app.js fetches sibling pages after DOMContentLoaded, so it announces when their controls exist.
document.addEventListener("ocean:layer-ready", initializeMidnightLayer);
