import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { authRoute } from "./routes/auth"
import { serveStatic } from 'hono/bun'
import { HTTPException } from 'hono/http-exception'

const app = new Hono()


app.use("*", logger())

app.onError((err, c) => {
    console.error(err.cause)
    if (err instanceof HTTPException) {
      return c.json({message:err.message}, err.status)
    }
    console.error(err.message)
    return c.json({message: "an error has occured"}, 500)
})

const apiRoutes = app.basePath("/api")
.route("/", authRoute)
//TODO: add container routes

app.get("*", serveStatic({root: './frontend/dist'}))
app.get("*", serveStatic({path: './frontend/dist/index.html'}))

export default app
export type ApiRoutes = typeof apiRoutes
