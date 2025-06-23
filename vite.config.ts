import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    rollupOptions: {
      watch: {
        exclude: ["**/app/lib/vendor/**", "**/app/lib/dic/glyphs/**"],
      },
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
  resolve: {
    // https://github.com/prisma/prisma/issues/12504#issuecomment-2094394268
    alias: {
      ".prisma/client/index-browser":
        "./node_modules/.prisma/client/index-browser.js",
      ".prisma/client/edge": "./node_modules/.prisma/client/edge.js",
    },
  },
});

// kern.maxfiles: 245760
// kern.maxfilesperproc: 122880
