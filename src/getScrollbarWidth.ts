/**
 * The cached width of the scrollbar. Can be undefined if not yet computed or "0" is scrollbars are
 * hidden by default.
 */
let scrollbarWidth: number | undefined;

/**
 * Lazy compute the scrollbar width for this OS and browser. Cached values used later.
 *
 * @returns Scrollbar width in px.
 */
function getScrollbarWidth() {
  if (scrollbarWidth !== undefined) return scrollbarWidth;

  const dummy = document.createElement("div");

  Object.assign(dummy.style, {
    position: "absolute",
    inset: "-200px",
    width: "100px",
    height: "100px",
    overflow: "scroll",
  });

  document.body.appendChild(dummy);
  scrollbarWidth = dummy.offsetWidth - dummy.clientWidth;
  document.body.removeChild(dummy);

  return scrollbarWidth;
}

let didInit = false;

/**
 * Inits the --scrollbar-width CSS property for future use. Can be called more than once.
 */
function initScrollbarWidthProperty() {
  if (didInit) return;
  document.documentElement.style.setProperty("--scrollbar-width", `${getScrollbarWidth()}px`);
  didInit = true;
}

function hideScrollbar() {
  initScrollbarWidthProperty();
  document.documentElement.classList.add("modal-open");
}

function showScrollbar() {
  document.documentElement.classList.remove("modal-open");
}

export { hideScrollbar, showScrollbar };
