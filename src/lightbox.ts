import { hideScrollbar, showScrollbar } from "./getScrollbarWidth";
import { isReduceMotion } from "./isReduceMotion";

// Finds all photo buttons and adds a click event listener to open the lightbox with the photo.
// Assume the button has an image child with the class "photo".
const photoButtons = document.querySelectorAll<HTMLButtonElement>("button:has(> .photo)");

photoButtons.forEach((photoButton) => {
  const image = photoButton.querySelector("img")!;
  photoButton.addEventListener("click", () => {
    openLightbox(image);
  });
});

/**
 * Converts an HTML string into a DOM element.
 *
 * @param html The HTML string to convert.
 * @returns The first DOM element created from the HTML string.
 */
function htmlToDom(html: string) {
  const dummy = document.createElement("div");
  dummy.innerHTML = html;
  return dummy.firstElementChild as HTMLElement;
}

/**
 * Asynchronously builds a lightbox dialog element for a given photo.
 *
 * @param photo The HTMLImageElement for which the lightbox is being built.
 * @returns A promise that resolves to an HTMLDialogElement representing the lightbox. Used since
 *          the new photo must be loaded before the lightbox can be displayed.
 * @throws An error if the image fails to load.
 */
async function buildLightbox(photo: HTMLImageElement) {
  const figure = photo.closest("figure");
  const caption = figure?.querySelector("figcaption");

  const html = `
    <dialog class="lightbox">
      <img class="lightbox__photo photo" src="${photo.currentSrc}"
      height="${photo.getAttribute("height")}"
      width="${photo.getAttribute("width")}"
      alt="${photo.alt}">
      <p class="lightbox__text opacity-0">${caption?.textContent || ""}</p>
    </dialog>`;

  const lightbox = htmlToDom(html) as HTMLDialogElement;

  const newPhoto = lightbox.querySelector(".lightbox__photo")!;

  return new Promise<HTMLDialogElement>((resolve) => {
    newPhoto.addEventListener("load", () => {
      resolve(lightbox);
    });

    newPhoto.addEventListener("error", (error) => {
      throw new Error("img not loaded. Skipping " + photo.currentSrc);
    });
  });
}

/**
 * Opens a lightbox to display a given photo with animations and event listeners.
 *
 *
 * This function performs the following actions:
 * - Hides the scrollbar.
 * - Builds and displays the lightbox with the provided photo.
 * - Adds event listeners for closing the lightbox on click, swipe, cancel, and keydown events.
 * - Animates the photo into the lightbox.
 * - Hides the original photo button.
 *
 * The lightbox can be closed by clicking outside the photo, swiping, pressing the cancel button, or
 * pressing the space key.
 *
 * @param photo - The image element of the photo to display in the lightbox.
 * @returns A promise that resolves when the lightbox is fully opened and animated.
 */
async function openLightbox(photo: HTMLImageElement) {
  hideScrollbar();
  const lightboxDialog = await buildLightbox(photo);

  const newPhoto = lightboxDialog.querySelector(".lightbox__photo") as HTMLElement;
  const text = lightboxDialog.querySelector(".lightbox__text")!;

  lightboxDialog.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;
    if (el.nodeName === "P") return;

    e.preventDefault();
    closeLightbox();
  });

  addOnSwipe(lightboxDialog, closeLightbox);

  lightboxDialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeLightbox();
  });

  lightboxDialog.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      closeLightbox();
    }
  });

  document.body.appendChild(lightboxDialog);
  lightboxDialog.showModal();

  // this delay is for Safari, which still has the dialog as display:none for one tick so will not
  // animate if added before then
  setTimeout(() => lightboxDialog.classList.add("is-open"));

  const photoButton = photo.parentNode as HTMLButtonElement;
  photoButton.style.visibility = "hidden";

  // Animate in
  const rect = photo.getBoundingClientRect();
  const newRect = newPhoto.getBoundingClientRect();

  const scaleH = rect.height / newRect.height;
  const scaleW = rect.width / newRect.width;
  const diffY = rect.y - newRect.y;
  const diffX = rect.x - newRect.x;

  const animOptions = {
    easing: "ease",
    duration: 400,
  };

  const startTransform = `translateY(${diffY}px) translateX(${diffX}px) scale(${scaleW}, ${scaleH})`;
  const endTransform = `translate(0, 0) scale(1) `;

  let scaleAnim: Animation | undefined;

  if (!isReduceMotion()) {
    scaleAnim = newPhoto.animate(
      {
        transform: [startTransform, endTransform],
      },
      animOptions
    );
  }

  text.classList.remove("opacity-0");

  async function closeLightbox() {
    scaleAnim?.cancel();
    text.classList.add("opacity-0");

    newPhoto.style.borderWidth = `${10 / scaleH}px`;

    lightboxDialog.classList.remove("is-open");

    if (!isReduceMotion()) {
      await newPhoto.animate(
        {
          transform: [endTransform, startTransform],
        },
        animOptions
      ).finished;
    }

    photoButton.style.visibility = "";

    lightboxDialog.close();
    lightboxDialog.parentElement?.removeChild(lightboxDialog);
    showScrollbar();
  }
}

/**
 * Adds a touch listener to check if an element has been vertically swiped on. Used to close
 * lightbox on swipe.
 *
 * @param element Element to watch for swipes on.
 * @param callback Callback when swipe ends if past internal threshold.
 */
function addOnSwipe(element: HTMLElement, callback: () => void) {
  const swipeThreshold = 50;

  let startY = 0;
  let endY = 0;

  element.addEventListener(
    "touchstart",
    (e) => {
      startY = e.touches[0].clientY;
      endY = startY;
    },
    { passive: true }
  );

  element.addEventListener(
    "touchmove",
    (e) => {
      endY = e.touches[0].clientY;
    },
    { passive: true }
  );

  element.addEventListener(
    "touchend",
    (e) => {
      const diff = endY - startY;

      if (Math.abs(diff) > swipeThreshold) {
        e.preventDefault();
        callback();
      }

      startY = 0;
      endY = 0;
    },
    { passive: true }
  );
}
