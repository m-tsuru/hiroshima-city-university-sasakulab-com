import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";

import { Bindings } from "./utils";
import { authorizeUser } from "./token";

export const authMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: {
    userId: string;
  };
}>(async (c, next) => {
  // Authorization ヘッダまたは Cookie からトークンを取得
  let idToken = c.req.header("Authorization");
  if (!idToken) {
    idToken = getCookie(c, "token");
  }

  const userIdResult = await authorizeUser(idToken, c.env.DB);
  if (userIdResult.type === "error") {
    return c.json({ error: userIdResult.message }, userIdResult.status);
  }

  c.set("userId", userIdResult.value);
  await next();
});
