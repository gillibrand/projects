import { closeMenu } from "./hamburger";
import { isReduceMotion } from "./isReduceMotion";

let dummy: HTMLDivElement | undefined;

function escapeHtml(text: string | null): string {
  if (!text) return "";

  if (!dummy) {
    dummy = document.createElement("div");
  }

  dummy.textContent = text;
  const safe = dummy.innerHTML;
  dummy.innerHTML = "";
  return safe;
}

const navmenu = document.getElementById("navmenu") as HTMLUListElement;

function markSelected(a?: HTMLAnchorElement | HTMLHeadingElement) {
  if (!a) return;

  if (a.nodeName !== "A") {
    const section = a.parentElement;
    const sectionId = section?.id;
    a = document.querySelector(`[data-to="${sectionId}"]`) as HTMLAnchorElement;
  }

  navmenu.querySelectorAll(".is-selected").forEach((el) => el.classList.remove("is-selected"));
  a.classList.add("is-selected");

  if ("scrollIntoViewIfNeeded" in a) {
    const aPlus = a as HTMLElement & { scrollIntoViewIfNeeded: Function };
    aPlus.scrollIntoViewIfNeeded();
  }
}

/**
 * Initializes the navigation menu by generating links for each section in the main content.
 *
 * @remarks
 * - The function assumes the existence of a global `navmenu` element and a `closeMenu` function.
 * - The `isReduceMotion` function is used to determine whether to use smooth scrolling or not.
 */
function initNavmenu() {
  const linkFrags: string[] = [];
  document.querySelectorAll("main section[id]").forEach((section) => {
    const sectionId = section.id;
    const heading = section.querySelector("h1,h2,h3,h4") as HTMLHeadingElement | null;
    if (!heading) return;

    const sectionTitle = heading.dataset.alt || heading.textContent;

    const classNames = ["navmenu__entry"];
    if (heading.nodeName === "H2" || heading.nodeName === "H1") {
      classNames.push("navmenu__entry--group");
    }

    linkFrags.push(
      `<li><a class="${classNames.join(" ")}" data-to="${sectionId}" href="#${sectionId}">
        <span>${escapeHtml(sectionTitle)}</span>
        </a></li>`
    );
  });

  navmenu.innerHTML = linkFrags.join("");

  navmenu.addEventListener("click", (e: MouseEvent) => {
    const a = e.target as HTMLAnchorElement;
    if (a.nodeName !== "A") return;
    e.preventDefault();

    // Update URL since it looks nice, but replace state so we don't pollute history
    // window.history.replaceState(undefined, "", a.href);

    // Top link TRY to center it so we actually scroll to the top of the page instead.
    const block = a.dataset.to === "me" ? "center" : "start";

    const section = document.getElementById(a.dataset.to!);
    section?.scrollIntoView({
      behavior: isReduceMotion() ? "auto" : "smooth",
      block,
    });

    closeMenu();
  });
}

/**
 * Initializes an IntersectionObserver to monitor the visibility of section headers and update the
 * navigation menu accordingly.
 *
 * The observer triggers a callback function when a header element intersects with the viewport. The
 * callback function marks the corresponding navigation link as selected.
 *
 * The function also checks the current scroll position and marks the appropriate navigation link as
 * selected based on the initial scroll position.
 *
 * @remarks
 * This function assumes that each section has an `id` attribute and contains a header element
 * (`h1`, `h2`, or `h3`). It also assumes that the navigation links have a `data-to` attribute
 * corresponding to the section `id`.
 */
function initIntersectionObserver() {
  // Callback function for the observer. Checks if intersecting a header
  function handleIntersection(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const heading = entry.target as HTMLHeadingElement;
        const section = heading.parentElement as HTMLElement;
        const sectionId = section.id;
        const a = document.querySelector(`[data-to="${sectionId}"]`) as HTMLAnchorElement;
        markSelected(a);
      }
    });
  }

  // Create an IntersectionObserver instance
  const observer = new IntersectionObserver(handleIntersection, {
    root: null, // Use the viewport as the root
    rootMargin: "0px 0px -80% 0px",
    threshold: 0, // Trigger as soon as the element is within the margin
  });

  const sections = Array.from(document.querySelectorAll("section[id]")) as HTMLElement[];
  const headings = sections.map((section) => {
    return section.querySelector("h1,h2,h3") as HTMLHeadingElement;
  });

  const top = document.documentElement.scrollTop;
  for (const heading of headings.reverse()) {
    if (heading.offsetTop < top) {
      markSelected(heading);
      break;
    }
  }

  headings.forEach((heading) => {
    observer.observe(heading);
  });
}

initNavmenu();
initIntersectionObserver();
