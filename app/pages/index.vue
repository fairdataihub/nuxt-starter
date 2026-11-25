<script setup lang="ts">
import { useSeoMeta } from "#app";
import { computed, ref } from "vue";
import {
  UPageHero,
  UPageCard,
  UPageGrid,
  UContainer,
  UColorModeImage,
} from "#components";
import { getColorblindSafeColors } from "#shared/utils/constants";

useSeoMeta({
  title: "Home",
});

const links = ref([
  {
    label: "Get started",
    to: "/dashboard",
    icon: "i-lucide-square-play",
  },
  {
    label: "Changelog",
    to: "https://github.com/fairdataihub/nuxt-starter/blob/main/CHANGELOG.md",
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

const sampleItems = ref([
  { label: "Genomics", count: 128 },
  { label: "Imaging", count: 96 },
  { label: "Clinical", count: 84 },
  { label: "Wearables", count: 71 },
  { label: "Surveys", count: 63 },
  { label: "Proteomics", count: 52 },
  { label: "Metabolomics", count: 41 },
  { label: "Environmental", count: 33 },
]);

const maxSampleCount = computed(() =>
  Math.max(...sampleItems.value.map((item) => item.count)),
);

const coloredSampleItems = computed(() => {
  const colors = getColorblindSafeColors(sampleItems.value.length);

  return sampleItems.value.map((item, index) => ({
    ...item,
    color: colors[index],
    percent: (item.count / maxSampleCount.value) * 100,
  }));
});

const uiFeatures = ref([
  {
    title: "Theme",
    description:
      "Learn how to customize Nuxt UI components using Tailwind CSS v4.",
    icon: "i-lucide-swatch-book",
    class: "lg:col-span-2",
    image: {
      path: "https://picsum.photos/id/29/400",
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
      path: "https://picsum.photos/id/46/400",
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
    />

    <UContainer class="mb-20">
      <UPageGrid>
        <UPageCard
          v-for="(feature, index) in features"
          :key="index"
          v-bind="feature"
        />
      </UPageGrid>
    </UContainer>

    <UContainer class="my-10">
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

    <UContainer class="my-10">
      <UPageGrid>
        <UPageCard
          title="Prisma ORM"
          description="Use Prisma for schema management, migrations, and generated client/types to accelerate common CRUD workflows."
          icon="i-simple-icons-prisma"
          class="lg:col-span-2"
        />

        <UPageCard
          title="Kysely Query Builder"
          description="Use Kysely for advanced SQL composition, complex joins, and performance-sensitive queries with strong TypeScript safety."
          icon="i-lucide-database-zap"
        />
      </UPageGrid>
    </UContainer>

    <UContainer class="my-10">
      <UPageCard
        title="Colorblind-safe palette"
        description="Sample datasets colored with getColorblindSafeColors() from shared/utils/constants.ts."
        icon="i-lucide-palette"
      >
        <ul class="flex flex-col gap-3">
          <li
            v-for="item in coloredSampleItems"
            :key="item.label"
            class="flex items-center gap-3"
          >
            <span
              class="size-3 shrink-0 rounded-full"
              :style="{ backgroundColor: item.color }"
            />

            <span class="w-28 shrink-0 text-sm font-medium">
              {{ item.label }}
            </span>

            <div class="bg-elevated h-2 flex-1 overflow-hidden rounded-full">
              <div
                class="h-full rounded-full"
                :style="{
                  width: `${item.percent}%`,
                  backgroundColor: item.color,
                }"
              />
            </div>

            <span
              class="text-muted w-10 shrink-0 text-right text-sm tabular-nums"
            >
              {{ item.count }}
            </span>

            <code class="text-muted hidden w-20 shrink-0 text-xs sm:block">
              {{ item.color }}
            </code>
          </li>
        </ul>
      </UPageCard>
    </UContainer>

    <UContainer class="my-10">
      <UPageGrid>
        <UPageCard v-for="(ui, index) in uiFeatures" :key="index" v-bind="ui">
          <UColorModeImage
            v-if="ui.image"
            :light="ui.image.path"
            :dark="ui.image.path"
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
