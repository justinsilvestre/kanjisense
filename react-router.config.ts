import type { Config } from "@react-router/dev/config";

export default {
  prerender: [
    "/browse/sound-components",
    "/browse/atomic-components",
    "/browse/compound-components",
    "/dict/middle-chinese",
    "/dict/middle-chinese-pronunciation",
  ],
} satisfies Config;
