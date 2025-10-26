import { defineConfig } from "vite";
import { ViteMinifyPlugin } from "vite-plugin-minify";

export default defineConfig(({ command, mode }) => {
  return {
    base: command === "build" || mode === "preview" ? "/projects/" : "/",
    build: {
      XoutDir: "../dist/projects",
    },
    plugins: [ViteMinifyPlugin({})],
  };
});
