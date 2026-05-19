<script setup lang="ts">
import { faker } from "@faker-js/faker";

definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({
  title: "Dashboard",
});

const toast = useToast();

const { data: things, error } = await useFetch("/api/thing", {
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

  await $fetch("/api/thing", {
    method: "POST",
    body: {
      name: thingName,
    },
  })
    .then(() => {
      toast.add({
        title: "Thing created",
        description: `Thing "${thingName}" created successfully.`,
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
  await $fetch(`/api/thing/${id}`, {
    method: "DELETE",
  })
    .then(() => {
      toast.add({
        title: "Thing deleted",
        description: `Thing with ID "${id}" deleted successfully.`,
        icon: "material-symbols:check-circle",
        color: "success",
      });

      window.location.reload();
    })
    .catch(() => {
      toast.add({
        title: "Error deleting thing",
        description: `Failed to delete thing with ID "${id}".`,
        icon: "material-symbols:error",
        color: "error",
      });
    });
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-6">
    <UPageHeader
      title="Dashboard"
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
      <UButton color="primary" variant="outline" to="/app/kysely-dashboard">
        Kysely Dashboard
      </UButton>

      <UButton color="primary" variant="outline" icon="material-symbols:add" @click="addThing">
        Add Thing
      </UButton>
    </div>

    <UPageList>
      <div v-for="thing in things" :key="thing.id" class="flex items-center justify-between p-4">
        <div>
          <h3 class="text-lg font-semibold">{{ thing.name }}</h3>

          <p class="text-xs text-gray-300">{{ thing.id }}</p>
        </div>

        <UButton
          color="error"
          variant="outline"
          icon="material-symbols:delete"
          @click="deleteThing(thing.id)"
        >
          Delete
        </UButton>
      </div>
    </UPageList>
  </div>
</template>
