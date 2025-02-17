import app from "./app"

Bun.serve({
  fetch: app.fetch,
  port: 3000
})

console.log("server is running")
