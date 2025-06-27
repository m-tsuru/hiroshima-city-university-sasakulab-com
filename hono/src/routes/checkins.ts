import { Hono } from "hono";

import { Bindings } from "../libs/utils";
import { authorizeUser } from "../libs/token";
import { getCookie } from "hono/cookie";
import { fetchCheckins, insertCheckin, updateCheckin } from "../libs/db";

const app = new Hono<{ Bindings: Bindings }>();

app.post("/api/record", async (c) => {
  const idToken = getCookie(c, "token");
  const userIdResult = await authorizeUser(idToken, c.env.DB);
  if (userIdResult.type === "error") {
    return c.json({ error: userIdResult.message }, userIdResult.status);
  }
  const userId = userIdResult.value;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();

  const locationId = "utsukuba";
  const checkinResult = await fetchCheckins(
    userId,
    { year, month, day, hours, locationId },
    c.env.DB
  );

  // 存在しない場合は追加
  if (checkinResult.length === 0) {
    await insertCheckin(userId, year, month, day, hours, locationId, c.env.DB);
    return;
  }

  // 存在する場合はインクリメント
  const checkinId = checkinResult[0].id;
  const count = checkinResult[0].count + 1;
  await updateCheckin(checkinId, count, c.env.DB);
});

export default app;
