import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    watch: {
      ignored: ["**/app/lib/vendor/**"],
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
