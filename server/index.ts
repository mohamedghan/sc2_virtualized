import app from "./app"
import { websocket } from "./routes/containers"

Bun.serve({
  fetch: app.fetch,
  websocket,
  port: 3000
})

console.log("server is running")
