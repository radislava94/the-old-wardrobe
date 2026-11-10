import { headers } from "next/headers";
import { authReady } from "./config";
import { getAuth } from "../auth";

export async function getSession() {
  if (!authReady()) return null;
  return getAuth().api.getSession({ headers: await headers() });
}
