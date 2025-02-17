import { zValidator,  } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { jwt, sign } from 'hono/jwt';
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema/users";
import { and, eq } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import { HTTPException } from 'hono/http-exception'
import type { JWTPayload } from "hono/utils/jwt/types";

type Variables = {
  jwtPayload: JWTPayload & {
    iat: number,
    exp: number,
    id:number
  },
  user: {
    id: number;
    username: string;
  };
  container: any;
  
}

export type Env = {
  Variables: Variables
};


const JWT_SEC = process.env.JWT_SEC;

const loginSchema = z.object({
  username: z.string().min(3).max(13),
  password: z.string().min(8).max(30)
})

const generateToken = async (id: number) => {
  return await sign({
    id,
    iat: Date.now() / 1000 - 5,
    exp: Date.now() / 1000 + 10*60
  }, JWT_SEC, "HS256")
}

export const getUser = createMiddleware<Env>(async (c, next) => {
    return await handlejwt(c, async () => {
      try {
        const payload = c.get('jwtPayload')
        const user = await db.select({id: users.id, username: users.username,}).from(users).where(eq(users.id, payload.id)).get()
        if(!user) throw ERROR_401;
        c.set("user", user);
        await next();
      } catch (e) {
          console.error(e);
          throw new HTTPException(401, {cause: e, message: (e as Error).message})
      }
    })
});

const ERROR_401 = new HTTPException(401, {message: "you are not allowed to login"})

export const handlejwt = jwt({
  secret: JWT_SEC,
  alg: "HS256",
  cookie: "token"
})

export const authRoute = new Hono<{ Variables: Variables }>()
  .post("/login", zValidator("json", loginSchema,  (result, _) => {
    if (!result.success) {
      throw ERROR_401
    }
  }), async (c) => {
    const data = await c.req.valid("json")
    const username = data.username.trim()
    const password = data.password.trim()
    const user = await db.select().from(users).where(and(eq(users.username, username), eq(users.password, password))).get()
    if(!user) {
      throw ERROR_401
    }
    const token = await generateToken(user.id);
    setCookie(c, 'token', token, {
      httpOnly: true,
    })
    return c.json({message: "authenticated successfully"}, 200);
  })
  .post("/register", zValidator("json", loginSchema, (result, _) => {
    if (!result.success) {
      throw ERROR_401
    }
  }), async (c) => {
    const data = await c.req.valid("json")
    const username = data.username.trim()
    const password = data.password.trim()
    let user = await db.select().from(users).where(eq(users.username, username)).get()
    if(user) {
      throw ERROR_401
    }

    await db.insert(users).values({
      username: username,
      password: password
    })
    // await $` echo ${password} | mkpasswd --method=yescrypt -s`.text
    user = await db.select().from(users).where(eq(users.username, username)).get()
    const token = await generateToken(user!.id);
    setCookie(c, 'token', token, {
      httpOnly: true,
    })
    return c.json({message: "success"}, 201);
  })
  .get("/logout", async (c) => {
    setCookie(c, 'token', "", {expires: new Date()})
    return c.redirect("/");
  })
  .get("/me", getUser, async (c) => {
    const user = c.var.user
    return c.json({ user });
  });
