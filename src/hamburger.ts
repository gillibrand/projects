import { isReduceMotion } from "./isReduceMotion";

const hamburger = document.getElementById("hamburger")!;
const sidebar = document.getElementById("sidebar")!;
const navunderlay = document.getElementById("navunderlay")!;

/**
 * @returns true if the hamburger menu is open.
 */
function isOpen() {
  return document.body.classList.contains("nav-open");
}

/**
 * Toggles nav menu open or closed.
 */
function toggleMenu() {
  if (isOpen()) {
    closeMenu();
  } else {
    openMenu();
  }
}

const animOptions = {
  easing: "ease",
  duration: 200,
};

/**
 * Opens nav menu if not already open.
 */
function openMenu() {
  if (isOpen()) return;

  document.body.classList.add("nav-open");
  hamburger.setAttribute("aria-expanded", String(true));

  if (isReduceMotion()) return;

  sidebar.animate(
    {
      transform: ["translateX(-100%)", "translateX(0)"],
    },
    animOptions
  );

  navunderlay.animate(
    {
      opacity: ["0", "1"],
    },
    animOptions
  );
}

/**
 * Closes nav menu if not already closed.
 */
async function closeMenu() {
  if (!isOpen()) return;

  if (!isReduceMotion()) {
    const anim = sidebar.animate(
      {
        transform: ["translateX(0)", "translateX(-100%)"],
      },
      animOptions
    );

    navunderlay.animate(
      {
        opacity: ["1", "0"],
      },
      animOptions
    );

    await anim.finished;
  }

  document.body.classList.remove("nav-open");
  hamburger.setAttribute("aria-expanded", String(false));
}

// Toggle open and closed
hamburger.addEventListener("click", toggleMenu);

// Esc closes menu no matter what is focused.
document.body.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenu();
  }
});

// Click body underlay to close
navunderlay.addEventListener("click", closeMenu);

export { closeMenu };
