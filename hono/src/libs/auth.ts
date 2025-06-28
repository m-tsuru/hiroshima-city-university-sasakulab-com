import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";

import { Bindings } from "./utils";
import { authorizeUser } from "./token";

export const authMiddleware = (occursError: boolean) =>
  createMiddleware<{
    Bindings: Bindings;
    Variables: {
      userId: string | null;
    };
  }>(async (c, next) => {
    // Authorization ヘッダまたは Cookie からトークンを取得
    let idToken = c.req.header("Authorization");
    if (!idToken) {
      idToken = getCookie(c, "token");
    }

    const userIdResult = await authorizeUser(idToken, c.env.DB);
    if (userIdResult.type === "error") {
      if (occursError) {
        return c.json({ error: userIdResult.message }, userIdResult.status);
      } else {
        c.set("userId", null);
        await next();
        return;
      }
    }
    c.set("userId", userIdResult.value);
    await next();
  });
