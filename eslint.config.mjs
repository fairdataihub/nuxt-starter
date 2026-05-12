import withNuxt from "./.nuxt/eslint.config.mjs";

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

    "vue/max-attributes-per-line": [
      "warn",
      {
        singleline: 3,
        multiline: 1,
      },
    ],

    "vue/first-attribute-linebreak": [
      "warn",
      {
        singleline: "ignore",
        multiline: "below",
      },
    ],

    "vue/html-self-closing": [
      "warn",
      {
        html: {
          void: "never",
          normal: "always",
          component: "always",
        },
        svg: "always",
        math: "always",
      },
    ],

    "vue/padding-line-between-tags": [
      "error",
      [{ blankLine: "always", next: "*", prev: "*" }],
    ],
  },
});
