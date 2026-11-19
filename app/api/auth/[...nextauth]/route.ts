import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { applyRememberChoice } from "@/lib/remember-me";

// The Auth.js routes, plus "Remember me": without it, the sign-in cookie lasts only until the browser closes.
export async function GET(req: NextRequest) {
  return applyRememberChoice(req, await handlers.GET(req));
}

export async function POST(req: NextRequest) {
  return applyRememberChoice(req, await handlers.POST(req));
}
