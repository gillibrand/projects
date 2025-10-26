// ensure this is imported in whole for the side-effect of defining the component
import "course-clear";
import { CourseClear } from "course-clear";

/**
 * Converts a string to ROT13 encoding. This is just to obfuscate the greeting message in URLs.
 *
 * @param str The string to be encoded
 * @returns The encoded or decoded string since ROT13 is symmetric.
 */
function rot13(str: string | null) {
  if (null === str) return "";

  return str.replace(/[a-zA-Z]/g, (char: string) => {
    const base = char <= "Z" ? 65 : 97; // 'A' or 'a'
    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function get<T = HTMLElement>(id: string) {
  return document.getElementById(id) as T;
}

let sharedDialog: CourseClear | undefined;
let shouldFocusGreeting = false;

function getCourseClear() {
  if (sharedDialog) return sharedDialog;
  sharedDialog = document.getElementById("cc-dialog") as CourseClear;
  sharedDialog.style.display = "";

  const closeButton = sharedDialog.querySelector("#cc-close-button") as HTMLButtonElement;
  closeButton.addEventListener("click", () => {
    sharedDialog!.open = false;
  });

  const replayButton = sharedDialog.querySelector("#cc-replay-button") as HTMLButtonElement;
  replayButton.addEventListener("click", () => {
    sharedDialog!.open = false;
    setTimeout(() => (sharedDialog!.open = true), 300);
  });

  const link = sharedDialog.querySelector("a[href='#course-clear']") as HTMLAnchorElement;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    shouldFocusGreeting = true;
    sharedDialog!.open = false;

    get("course-clear")?.scrollIntoView(true);
  });

  sharedDialog.addEventListener("closed", () => {
    if (shouldFocusGreeting) {
      shouldFocusGreeting = false;
      const input = get<HTMLInputElement>("cc-greeting");
      if (input) {
        input.focus();
        input.select();
      }
    }
  });

  return sharedDialog;
}

function showDialog(greeting: string) {
  const dialog = getCourseClear();
  dialog.greeting = greeting;

  const colorRadio = document.querySelector(".color-radio > input:checked") as HTMLInputElement;
  const bgColor = colorRadio.value;
  dialog.style.setProperty("--cc-custom-bg-color", `var(${bgColor})`);

  // The default is fine, except for on yellow, which is too light and needs a custom color
  const color = colorRadio.dataset.color;
  if (color) {
    dialog.style.setProperty("--cc-custom-color", color);
  } else {
    dialog.style.removeProperty("--cc-custom-color");
  }

  dialog.open = true;
}

function initForm() {
  const greetingEl = get<HTMLInputElement>("cc-greeting");

  const key = "clearCourse.didGreeting";

  const params = new URLSearchParams(location.search.slice(1));
  let paramGreeting = (params.get("t") ?? params.get("hi") ?? rot13(params.get("r")) ?? "").trim();

  if (paramGreeting && (params.has("hi") || params.has("r"))) {
    // some old URLs have hello in them, so strip those and normalize with "Hello "
    paramGreeting = paramGreeting.replace(/^(hello|hi) /i, "");
    paramGreeting = "Hello " + paramGreeting;
  }

  const savedGreeting = (localStorage.getItem(key) || "").trim();

  let customGreeting = paramGreeting || savedGreeting;
  greetingEl.value = customGreeting || "Hello World!";

  const formEl = get<HTMLFormElement>("cc-form");
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const currentGreeting = greetingEl.value;
    showDialog(currentGreeting);
  });

  if (paramGreeting) {
    if (paramGreeting !== localStorage.getItem(key)) {
      localStorage.setItem(key, paramGreeting);
      showDialog(paramGreeting);
    }
  }
}

initForm();
