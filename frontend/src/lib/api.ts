import { type ApiRoutes } from "@server/app"
import { queryOptions } from "@tanstack/react-query";
import { hc } from "hono/client"

const client = hc<ApiRoutes>("/",{
  headers: {
    Authorization: localStorage.getItem("token") ?? ""
}})

export const api = client.api

async function getCurrentUser() {
    const res = await api.me.$get();
    if (!res.ok) {
      throw new Error("server error");
    }
    const data = await res.json();
    return data;
  }
  


export const userQueryOptions = queryOptions({
    queryKey: ["get-current-user"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });
  