<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const colorMode = useColorMode();
const { clear } = useUserSession();
const route = useRoute();

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [{ href: "/favicon.ico", rel: "icon" }],
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      name: "theme-color",
      content: colorMode.value === "dark" ? "#111827" : "white",
      key: "theme-color",
    },
  ],
});

useSeoMeta({
  ogImage:
    "https://kalai.fairdataihub.org/api/generate?title=Hello&description=This%20is%20a%20Nuxt%20starter%20template&app=fairdataihub&org=fairdataihub",
  titleTemplate: "%s - Nuxt Starter Template",
  twitterCard: "summary_large_image",
  twitterImage:
    "https://kalai.fairdataihub.org/api/generate?title=Hello&description=This%20is%20a%20Nuxt%20starter%20template&app=fairdataihub&org=fairdataihub",
});

const logout = async () => {
  clear();
  await navigateTo("/login");
};

const headerItems = computed<NavigationMenuItem[]>(() => [
  {
    label: "Dashboard",
    to: "/app/dashboard",
    active: route.path.startsWith("/app/dashboard"),
  },
  {
    label: "Changelog",
    to: "https://github.com/fairdataihub/nuxt-starter/CHANGELOG.md",
    target: "_blank",
  },
]);

const footerItems: NavigationMenuItem[] = [
  {
    label: "Made by FAIR Data Innovations Hub",
    to: "https://fairdataihub.org",
    target: "_blank",
  },
];

const color = computed(() =>
  colorMode.value === "dark" ? "#111827" : "white",
);
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <UHeader>
      <template #title>
        <NuxtLink to="/" class="flex text-2xl font-bold"> Nuxt App </NuxtLink>
      </template>

      <UNavigationMenu :items="headerItems" />

      <template #right>
        <UColorModeButton />

        <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
          <UButton
            color="neutral"
            variant="ghost"
            to="https://github.com/fairdataihub/nuxt-starter"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
          />
        </UTooltip>

        <AuthState v-slot="{ loggedIn }">
          <UButton
            v-if="loggedIn"
            color="neutral"
            variant="outline"
            @click="logout"
          >
            Logout
          </UButton>

          <div v-else class="flex items-center justify-center gap-3">
            <UButton to="/login" color="neutral" variant="outline">
              Sign in
            </UButton>

            <UButton to="/signup" color="neutral">
              <template #trailing>
                <Icon name="i-heroicons-arrow-right-20-solid" size="20" />
              </template>
              Sign up
            </UButton>
          </div>
        </AuthState>
      </template>
    </UHeader>

    <UMain class="py-4">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </template>

      <UNavigationMenu :items="footerItems" variant="link" />

      <template #right>
        <UButton
          icon="i-simple-icons-discord"
          color="neutral"
          variant="ghost"
          to="https://discord.gg/fairdataihub"
          target="_blank"
          aria-label="Discord"
        />
        <UButton
          icon="i-simple-icons-x"
          color="neutral"
          variant="ghost"
          to="https://x.com/fairdataihub"
          target="_blank"
          aria-label="X"
        />
        <UButton
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          to="https://github.com/fairdataihub"
          target="_blank"
          aria-label="GitHub"
        />
      </template>
    </UFooter>
  </UApp>
</template>
