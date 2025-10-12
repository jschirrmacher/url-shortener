<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60" class="logo">
    <!-- Erstes Kettenglied (versetzt nach oben) -->
    <ellipse cx="20" cy="22" rx="10" ry="14" class="chain-link"/>
    
    <!-- Zweites Kettenglied (versetzt nach unten) -->
    <ellipse cx="35" cy="32" rx="10" ry="14" class="chain-link"/>
    
    <!-- Logo Text -->
    <text x="55" y="28" class="logo-text">URL</text>
    <text x="55" y="48" class="logo-subtext">Shortener</text>
  </svg>
</template>

<style scoped>
.logo {
  display: block;
}

.chain-link {
  fill: none;
  stroke: var(--logo-chain-color, #2563eb);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.logo-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 600;
  font-size: 24px;
  fill: var(--logo-text-color, #1f2937);
}

.logo-subtext {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 16px;
  fill: var(--logo-subtext-color, #6b7280);
}
</style>
