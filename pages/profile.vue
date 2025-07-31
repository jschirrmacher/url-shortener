<script setup lang="ts">
const { user } = useAuthPageStandard("Profil - URL Shortener")
</script>

<template>
  <div class="max-w-4xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Mein Profil</h1>
      <p class="text-gray-600 mt-2">Verwalten Sie Ihre Konto-Einstellungen</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Profile Information -->
      <ProfileInfo :user="user" />

      <!-- Password Change Form -->
      <PasswordChangeForm />
    </div>
  </div>
</template>
