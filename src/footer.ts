/**
 * Adds a vanity class to the footer when it reaches the bottom of the viewport.
 */
function initFooterObserver() {
  const footer = document.querySelector("footer");

  if (!footer) {
    console.warn("Footer element not found.");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]!;
      footer.classList.toggle("is-end", entry.isIntersecting);
    },
    {
      threshold: 0.99,
    }
  );

  observer.observe(footer);
}

initFooterObserver();
