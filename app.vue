<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue';

onMounted(() => {
    nextTick(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker Registered'))
                .catch((err) => console.error('Service Worker Error:', err));
        }
    });
});
</script>





