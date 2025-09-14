<script setup lang="ts">
// Props
interface Props {
  title: string
  value: string | number
  icon?: string
  color?: "blue" | "green" | "orange" | "purple" | "red"
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  icon: "chart",
  color: "blue",
  subtitle: "",
})

// Color classes mapping
const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    icon: "text-blue-500",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    icon: "text-green-500",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-blue-600",
    icon: "text-orange-500",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    icon: "text-purple-500",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    icon: "text-red-500",
  },
}

// Icon mapping
const icons = {
  chart:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  users:
    "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
  click:
    "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
  globe:
    "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center">
      <div :class="[colorClasses[color].bg, 'flex-shrink-0 rounded-md p-3']">
        <svg :class="[colorClasses[color].icon, 'h-6 w-6']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="icons[icon as keyof typeof icons] || icons.chart"
          />
        </svg>
      </div>
      <div class="ml-5 w-0 flex-1">
        <dl>
          <dt class="text-sm font-medium text-gray-500 truncate">{{ title }}</dt>
          <dd>
            <div :class="[colorClasses[color].text, 'text-lg font-medium']">{{ value }}</div>
            <div v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</div>
          </dd>
        </dl>
      </div>
    </div>
  </div>
</template>
