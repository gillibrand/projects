import playUrl from "/images/play.svg";
import pauseUrl from "/images/pause.svg";
import replayUrl from "/images/replay.svg";

const players = document.querySelectorAll(".vidplayer");

/**
 * Creates a new image element with the given source URL.
 *
 * @param {string} src - The source URL of the image.
 * @returns {HTMLImageElement} The created image element.
 */
function newImg(src: string): HTMLImageElement {
  const img = document.createElement("img");
  img.src = src;
  return img;
}

/**
 * Sets the text and image of a button element.
 *
 * @param {HTMLElement} button - The button element to update.
 * @param {string} text - The text to set on the button.
 * @param {HTMLImageElement} img - The image to append to the button.
 */
function setButton(button: HTMLElement, text: string, img: HTMLImageElement): void {
  button.innerHTML = "";
  button.textContent = text;
  button.appendChild(img);
}

players.forEach((player) => {
  const video = player.querySelector(".vidplayer__video") as HTMLVideoElement;
  const button = player.querySelector(".vidplayer__button") as HTMLButtonElement;
  const overlay = player.querySelector<HTMLElement>(".vidplayer__overlay");

  function played() {
    if (overlay) overlay.style.display = "none";
    setButton(button, "Pause ", newImg(pauseUrl));
  }

  function paused() {
    setButton(button, "Play ", newImg(playUrl));
  }

  function ended() {
    setButton(button, "Replay ", newImg(replayUrl));
  }

  function togglePlay() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  button.addEventListener("click", togglePlay);
  video.addEventListener("click", (e) => {
    e.preventDefault();
    togglePlay();
  });

  video.addEventListener("play", played);
  video.addEventListener("pause", paused);
  video.addEventListener("ended", ended);

  // Init button to right state with glyph
  paused();
});
