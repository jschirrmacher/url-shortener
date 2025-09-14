export function useClipboard() {
  async function copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      throw err
    }
  }

  return {
    copyToClipboard
  }
}
