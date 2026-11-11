// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-16",
  css: ["~/assets/css/main.css"],
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "nuxt-auth-utils", "dayjs-nuxt", "@nuxt/eslint"],

  // Do NOT read process.env here: values would be frozen into the build output.
  // Leave defaults empty and set them at runtime with NUXT_* env vars, e.g.
  // NUXT_MAIL_PASS, NUXT_EMAIL_VERIFICATION_DOMAIN,
  // NUXT_PUBLIC_ENABLE_EMAIL_VERIFICATION. See .env.example.
  runtimeConfig: {
    emailVerificationDomain: "",
    mailFrom: "",
    mailHost: "",
    mailPass: "",
    mailPort: "587",
    mailUser: "",
    public: {
      ENABLE_EMAIL_VERIFICATION: false,
    },
  },

  routeRules: {
    "/**": {
      headers: {
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    },
  },

  eslint: {},
  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "dayjs", // CJS
        "dayjs/plugin/updateLocale", // CJS
        "dayjs/plugin/relativeTime", // CJS
        "dayjs/plugin/utc", // CJS
      ],
    },
  },
});
