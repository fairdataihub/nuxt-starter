// @ts-check
import withNuxt from ".nuxt/eslint.config.mjs";

export default withNuxt({
  plugins: {
    "unused-imports": (await import("eslint-plugin-unused-imports")).default,
  },

  rules: {
    "@typescript-eslint/no-unused-vars": "off",

    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        next: "return",
        prev: "*",
      },
    ],

    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",

    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",

    "unused-imports/no-unused-imports": "error",

    "unused-imports/no-unused-vars": [
      "warn",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        vars: "all",
        varsIgnorePattern: "^_",
      },
    ],

    "vue/padding-line-between-tags": [
      "error",
      [{ blankLine: "always", next: "*", prev: "*" }],
    ],
  },
});
