export default defineEventHandler((event) => {
  return {
    message: 'Hello World!',
    timestamp: new Date().toISOString()
  }
})
