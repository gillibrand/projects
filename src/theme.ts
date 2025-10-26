const AllThemes = ["theme-bright", "theme-light", "theme-dark"] as const;
type Theme = (typeof AllThemes)[number];

const DefaultTheme = "theme-bright";

function writeTheme(theme: Theme) {
  localStorage.setItem("theme", theme);
}

function isTheme(theme: string): theme is Theme {
  return AllThemes.includes(theme as Theme);
}

function readTheme(): Theme {
  let theme = localStorage.getItem("theme") || DefaultTheme;
  return isTheme(theme) ? theme : DefaultTheme;
}

function loadTheme() {
  const theme = readTheme();
  themeSelect.value = theme;
  document.body.classList.add(theme);
}

// Init select
const themeSelect = document.getElementById("theme-select") as HTMLSelectElement;
themeSelect.addEventListener("change", (e) => {
  const theme = themeSelect.value as Theme;
  document.body.classList.remove(...AllThemes);
  document.body.classList.add(theme);
  writeTheme(theme);
});

loadTheme();
