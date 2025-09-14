<script setup lang="ts">
interface Props {
  shortCode: string
  qrCodeUrl?: string
}

interface Emits {
  download: [format: 'png' | 'svg']
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <section class="qr-section">
    <h3>QR-Code</h3>
    <div class="qr-content">
      <div class="qr-code-container">
        <div v-if="!qrCodeUrl" class="qr-loading">
          <div class="loading-spinner" />
        </div>
        <img v-else :src="qrCodeUrl" :alt="`QR-Code für ${shortCode}`" class="qr-image">
      </div>
      
      <div class="download-buttons">
        <DownloadButton format="png" :disabled="!qrCodeUrl" @click="$emit('download', 'png')" />
        <DownloadButton format="svg" :disabled="!qrCodeUrl" @click="$emit('download', 'svg')" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.qr-section {
  padding-top: 1.5rem;
}

.qr-section h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 1rem 0;
}

.qr-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
}

.qr-code-container {
  display: inline-block;
  padding: 1rem;
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
}

.qr-loading {
  width: 8rem;
  height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-bottom-color: #ea580c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.qr-image {
  width: 8rem;
  height: 8rem;
  display: block;
}

.download-buttons {
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  gap: 0.5rem;
  min-width: 120px;
}
</style>
