import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import { getUser, type Env } from "./auth";
import { db } from "../db";
import { containers } from "../db/schema/containers";
import { eq } from "drizzle-orm";
import { createBunWebSocket } from 'hono/bun'
import { fetch, type ServerWebSocket, type Socket, } from 'bun'
import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket<{
  connId: number;
  url: URL;
  protocol: string;
}>>()

const connections: { [key: string]: Socket<undefined>; } = {};

const unix = "/var/run/docker.sock";

const changeContainerSchema = z.object({
  state: z.enum(["start", "stop"])
})

const containerSchema = z.object({
    Id: z.string().min(1),
    Image: z.string(),
    Config: z.object({
        Image: z.string(),
    }),
    Name: z.string(),
    State: z.object({
        "Running": z.boolean(),
        "Paused": z.boolean(),
        "Status": z.string(),
        Dead: z.boolean()
    })
})

type Container = z.infer<typeof containerSchema>

const containerExists = createMiddleware<Env>(async (c, next) => {
  const user = c.var.user;
  const container = await db.select().from(containers).where(eq(containers.owner, user.id)).get()
  if(!container) throw new HTTPException(404, {message: "you need to create a new instance"})
  
  const response = await fetch(`http://localhost/containers/${container.id}/json`, { unix });

  if(response.status == 404) {
    throw new HTTPException(404, {message: "your instance was destroyed. create a new one"}) 
  } else if (response.status == 500) {
    throw new HTTPException(500, {message: "There was an error. please try later"}) 
  }
  
  const body = await response.json();

  c.set("container", {id: container.id, data: body});
  await next()
});


export const containersRoute = new Hono().use(getUser)
.get("/", containerExists, async (c) => {
    return c.json(c.var.container.data as Container)
})
.post("/change", containerExists, zValidator("json", changeContainerSchema), async (c) => {
  const {state} = c.req.valid("json")
  const id = c.var.container.id
  console.log(id)
  const response = await fetch(`http://localhost/containers/${id}/${state}?t=2`, { unix, method: "POST" });
  await fetch(`http://localhost/containers/${id}/wait?condition=not-running`, { unix, method: "POST" });
  console.log(await response.json())
  if(response.status == 404) {
    throw new HTTPException(404, {message: "instance does not exist"}) 
  } else if (response.status == 500) {
    throw new HTTPException(500, {message: "there was an error. please try later"}) 
  }
  
  return c.json({}, 200)
})
.post("/", async (c) => {  
    const user = c.var.user;    
    try {
        const containerConfig = {
            Hostname: user.username,
            Domainname: "local",
            Image: 'sc2:latest',
            ExposedPorts: {
              '5901/tcp': {}
            },
            Env: ["PASSWORD="+user.username],
            HostConfig: {
               "Memory": 500*1024*1024,
            },
            NetworkingConfig: {
              EndpointsConfig: {
                ex5: {
                  NetworkID: "sc2_network"
                }
              }
            }
        };
      const createResponse = await fetch("http://localhost/containers/create", {
        unix, 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(containerConfig),
       });

      const createResponseBody = await createResponse.json();
      const containerId = createResponseBody.Id;
      console.log(`Container created with ID: ${containerId}`);
      const container = await db.select().from(containers).where(eq(containers.owner, user.id)).get()
      if(container) {
        //  const response = await fetch(`http://localhost/containers/${c.var.container.id}?v=false&force=true&link=false`, { unix, method: "DELETE" });
        await db.delete(containers).where(eq(containers.id, container.id))
      }
      await db.insert(containers).values({
        id: containerId,
        owner: user.id
      })
      return c.json({id:containerId})
    } catch (err) {
      console.error(err)
      throw new HTTPException(500, {message: "there was an error server side and i don't know what"}) 
    }
}) 
.get("/ws", containerExists,upgradeWebSocket((c) => {
  return {
  async onOpen(event, ws) {
      const raw = ws.raw!;
      const user = c.var.user;
      
      const address = c.var.container.data.NetworkSettings.Networks.sc2_network.IPAddress
      console.log(address)
      await Bun.connect({
          hostname: address,
          port: 5901,
          socket: {
            data(socket, data) {
              ws.send(data)
            },
            open(socket) {
              console.log("TCP open")
              connections[raw.data.connId] = socket;
            },
            close(socket) {},
            drain(socket) {},
            error(socket, error) {},
            connectError(socket, error) {},
            end(socket) {
              console.log("TCP closed")
              ws.close()
              delete connections[raw.data.connId]
            }, 
            timeout(socket) {},
          },
      });
  },
  onMessage(event, ws) {
      const raw = ws.raw!;
      connections[raw.data.connId].write(event.data as string)
  },
  onClose(event,ws) {
      const raw = ws.raw!;
      const id = raw.data.connId;
      connections[id].end()
      delete connections[id]
      console.log('Connection closed')
  },
  }   
}))


export { websocket }
