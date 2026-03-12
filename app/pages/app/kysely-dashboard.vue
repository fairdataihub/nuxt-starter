<script setup lang="ts">
import { faker } from "@faker-js/faker";

definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({
  title: "Dashboard",
});

const toast = useToast();

const { data: things, error } = await useFetch("/api/kysely-thing", {
  method: "GET",
});

if (error.value) {
  toast.add({
    title: "Error fetching things",
    description: error.value.data?.statusMessage,
    icon: "material-symbols:error",
    color: "error",
  });
}

const addThing = async () => {
  const thingName = faker.word.words({ count: 1 });

  await $fetch("/api/kysely-thing", {
    method: "POST",
    body: {
      name: thingName,
    },
  })
    .then(() => {
      toast.add({
        title: "Kysely Thing created",
        description: `Kysely Thing "${thingName}" created successfully.`,
        icon: "material-symbols:check-circle",
        color: "success",
      });

      window.location.reload();
    })
    .catch(() => {
      toast.add({
        title: "Error creating thing",
        description: "Failed to create thing.",
        icon: "material-symbols:error",
        color: "error",
      });
    });
};

const deleteThing = async (id: string) => {
  await $fetch(`/api/kysely-thing/${id}`, {
    method: "DELETE",
  })
    .then(() => {
      toast.add({
        title: "Kysely Thing deleted",
        description: `Kysely Thing with ID "${id}" deleted successfully.`,
        icon: "material-symbols:check-circle",
        color: "success",
      });

      window.location.reload();
    })
    .catch(() => {
      toast.add({
        title: "Error deleting Kysely Thing",
        description: `Failed to delete Kysely Thing with ID "${id}".`,
        icon: "material-symbols:error",
        color: "error",
      });
    });
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-6">
    <UPageHeader
      title="Kysely Dashboard"
      description="A responsive page header with title, description and actions."
    >
      <template #headline>
        <UBreadcrumb
          :items="[
            { label: 'Home', to: '/' },
            { label: 'Dashboard', to: '/app/dashboard' },
          ]"
        />
      </template>
    </UPageHeader>

    <div class="flex items-center justify-end gap-2">
      <UButton color="primary" variant="outline" to="/app/dashboard">
        Prisma Dashboard
      </UButton>

      <UButton
        color="primary"
        variant="outline"
        @click="addThing"
        icon="material-symbols:add"
      >
        Add Thing
      </UButton>
    </div>

    <UPageList>
      <div
        v-for="thing in things"
        :key="thing.id"
        class="flex items-center justify-between p-4"
      >
        <div>
          <h3 class="text-lg font-semibold">{{ thing.name }}</h3>
          <p class="text-xs text-gray-300">{{ thing.id }}</p>
        </div>

        <UButton
          color="error"
          variant="outline"
          @click="deleteThing(thing.id)"
          icon="material-symbols:delete"
        >
          Delete
        </UButton>
      </div>
    </UPageList>
  </div>
</template>
