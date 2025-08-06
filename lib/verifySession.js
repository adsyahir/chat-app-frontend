export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null
 
  // Get user ID from session and fetch data
})