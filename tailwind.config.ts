import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        brush: ["yukyokasho", "tw-kai"],
        sans: ["Noto Sans JP", "Helvetica", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        kyoiku: colors.blue,
        joyo: colors.lime,
        jinmeiyo: colors.red,
        hyogai: colors.fuchsia,
        extra: colors.stone,
      },
    },
  },
  plugins: [],
} satisfies Config;
