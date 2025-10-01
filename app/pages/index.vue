<script setup lang="ts">
useSeoMeta({
  title: "Home",
});

const links = ref([
  {
    label: "Get started",
    to: "/docs/getting-started",
    icon: "i-lucide-square-play",
  },
  {
    label: "Learn more",
    to: "/docs/getting-started/theme/design-system",
    variant: "subtle" as const,
    trailingIcon: "i-lucide-arrow-right",
  },
]);

const features = ref([
  {
    title: "Accuracy rate",
    description: "99.95% in fulfilling orders",
    icon: "i-lucide-smile",
  },
  {
    title: "Startup businesses",
    description: "2,000+ partner with us",
    icon: "i-lucide-a-large-small",
  },
  {
    title: "Happy customers this year",
    description: "85% happy customer",
    icon: "i-lucide-sun-moon",
  },
]);

const uiFeatures = ref([
  {
    title: "Theme",
    description:
      "Learn how to customize Nuxt UI components using Tailwind CSS v4.",
    icon: "i-lucide-swatch-book",
    class: "lg:col-span-2",
    image: {
      path: "https://ui2.nuxt.com/illustrations/color-palette",
      width: 363,
      height: 152,
    },
    orientation: "horizontal" as const,
  },
  {
    title: "Fonts",
    description:
      "Nuxt UI integrates with Nuxt Fonts to provide plug-and-play font optimization.",
    icon: "i-lucide-a-large-small",
    variant: "soft" as const,
  },
  {
    title: "Color Mode",
    description:
      "Nuxt UI integrates with Nuxt Color Mode to switch between light and dark.",
    icon: "i-lucide-sun-moon",
    variant: "soft" as const,
  },
  {
    title: "Icons",
    description:
      "Nuxt UI integrates with Nuxt Icon to access over 200,000+ icons from Iconify.",
    icon: "i-lucide-smile",
    image: {
      path: "https://ui2.nuxt.com/illustrations/icon-library",
      width: 362,
      height: 184,
    },
    class: "lg:col-span-2",
    orientation: "horizontal" as const,
    reverse: true,
  },
]);
</script>

<template>
  <div>
    <UPageHero
      title="FAIR Data Innovations Hub - Nuxt Starter Template"
      description="A Nuxt starter template for the FAIR Data Innovations Hub. The starting point for all new projects and applications."
      headline="New release"
      :links="links"
    >
    </UPageHero>

    <UContainer class="mb-20">
      <UPageGrid>
        <UPageCard
          v-for="(feature, index) in features"
          :key="index"
          v-bind="feature"
        />
      </UPageGrid>
    </UContainer>

    <UContainer class="my-20">
      <UPageCard
        title="Tailwind CSS"
        description="Nuxt UI integrates with latest Tailwind CSS v4, bringing significant improvements."
        icon="i-simple-icons-tailwindcss"
        orientation="horizontal"
      >
        <img
          src="https://ui.nuxt.com/_ipx/_/tailwindcss-v4.svg"
          alt="Tailwind CSS"
          class="w-full"
        />
      </UPageCard>
    </UContainer>

    <UContainer class="my-20">
      <UPageGrid>
        <UPageCard v-for="(ui, index) in uiFeatures" :key="index" v-bind="ui">
          <UColorModeImage
            v-if="ui.image"
            :light="`${ui.image.path}-light.svg`"
            :dark="`${ui.image.path}-dark.svg`"
            :width="ui.image.width"
            :height="ui.image.height"
            :alt="ui.title"
            loading="lazy"
            class="w-full"
          />
        </UPageCard>
      </UPageGrid>
    </UContainer>
  </div>
</template>
