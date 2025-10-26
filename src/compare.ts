/**
 * A toggle input, but it should have a `data-compare` attribute with the ID of a parent element
 * containing two images to compare.
 */
interface ToggleInput extends HTMLInputElement {
  dataset: {
    compare?: string;
  };
}

/**
 * Add event listeners to a toggle input to swap compare images. Only call this once per toggle.
 *
 * @param toggle Toggle button to swap compare images.
 */
function initToggle(toggle: ToggleInput): void {
  const compareId = toggle.dataset["compare"];
  if (!compareId) return;

  const compare = document.getElementById(compareId);
  if (!compare) return;

  function update() {
    compare!.classList.toggle("compare--checked", toggle.checked);
  }

  // Update to match initially
  update();

  toggle.addEventListener("click", update);

  function changeToggle() {
    toggle.checked = !toggle.checked;
    update();
  }

  compare.addEventListener("click", changeToggle);
}

document.querySelectorAll<HTMLInputElement>(".toggle__checkbox").forEach(initToggle);
