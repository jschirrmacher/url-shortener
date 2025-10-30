type Theme = "light" | "dark" | "system"

export function useTheme() {
  const isDark = ref(false)
  const theme = ref<Theme>("system")

  function setThemeClass() {
    document.documentElement.classList.remove("dark")

    const shouldBeDark =
      theme.value === "dark" || (theme.value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    }
    
    isDark.value = shouldBeDark
  }

  function applyTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem("theme", newTheme)
    setThemeClass()
  }

  onMounted(() => {
    theme.value = (localStorage.getItem("theme") as Theme) ?? "system"
        isDark.value = document.documentElement.classList.contains("dark")
    
    if (theme.value === "system") {
      setThemeClass()
    }
    
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setThemeClass)
    
    onUnmounted(() => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", setThemeClass)
    })
  })

  return {
    isDark: readonly(isDark),
    theme: readonly(theme),
    currentTheme: computed(() => isDark.value ? 'dark' : 'light'),
    applyTheme
  }
}
