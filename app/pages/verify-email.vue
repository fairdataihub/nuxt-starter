<script setup lang="ts">
const { loggedIn } = useUserSession();

if (loggedIn.value) {
  await navigateTo("/dashboard");
}

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "Email Verification",
});

const route = useRoute();
const toast = useToast();
const token = route.query.token as string;
const verifying = ref(true);
const successMessage = ref("");
const errorMessage = ref("");

const resendEmail = ref("");
const resending = ref(false);

// Verify email when the page loads
onMounted(async () => {
  if (!token) {
    verifying.value = false;
    errorMessage.value = "No verification token found.";

    return;
  }

  try {
    const response = await $fetch("/api/auth/verify-email", {
      body: { token },
      method: "POST",
    });

    successMessage.value = "Email verified successfully! Redirecting...";
    toast.add({
      title: "Email Verified",
      color: "success",
      description: response.message,
      icon: "material-symbols:check-circle-outline",
    });

    setTimeout(() => {
      navigateTo("/login");
    }, 3000);
  } catch (error) {
    console.error(error);

    errorMessage.value =
      (error as { data?: { statusMessage?: string } }).data?.statusMessage ??
      "Email verification failed.";

    toast.add({
      title: "Verification Failed",
      color: "error",
      description: "Email verification failed. Please try again",
      icon: "material-symbols:error",
    });
  } finally {
    verifying.value = false;
  }
});

async function resendVerification() {
  if (!resendEmail.value) return;

  resending.value = true;

  await $fetch("/api/auth/resend-verification", {
    body: { emailAddress: resendEmail.value },
    method: "POST",
  })
    .then((response) => {
      toast.add({
        title: "Verification email requested",
        color: "info",
        description: response.message,
        icon: "material-symbols:mail-outline",
      });
    })
    .catch((error) => {
      toast.add({
        title: "Could not resend verification email",
        color: "error",
        description: error.data?.statusMessage ?? "Request failed",
        icon: "material-symbols:error",
      });
    })
    .finally(() => {
      resending.value = false;
    });
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold">
        {{ verifying ? "Verifying Email..." : successMessage || errorMessage }}
      </h1>

      <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>

      <p v-if="successMessage" class="text-green-500">{{ successMessage }}</p>

      <form
        v-if="!verifying && errorMessage"
        class="mt-6 flex flex-col items-center gap-2"
        @submit.prevent="resendVerification"
      >
        <p class="text-sm text-slate-600">
          Need a new link? Enter your email address.
        </p>

        <div class="flex gap-2">
          <UInput
            v-model="resendEmail"
            type="email"
            placeholder="you@example.com"
            required
          />

          <UButton type="submit" :loading="resending">Resend</UButton>
        </div>
      </form>
    </div>
  </div>
</template>
