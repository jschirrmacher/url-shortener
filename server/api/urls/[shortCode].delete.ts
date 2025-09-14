import useUrls from "~/server/useUrls"

export default defineEventHandler(async (event) => {
  const shortCode = getRouterParam(event, 'shortCode')
  
  if (!shortCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Short code is required'
    })
  }

  try {
    const { deleteUrl } = useUrls()
    await deleteUrl(shortCode)
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting URL:', error)
    
    if (error instanceof Error && error.message === 'URL nicht gefunden') {
      throw createError({
        statusCode: 404,
        statusMessage: 'URL not found'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete URL'
    })
  }
})
