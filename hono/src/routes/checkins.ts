import { Hono } from "hono";

import { Bindings, getIP, isInternalIP } from "../libs/utils";
import { authorizeUser } from "../libs/token";
import { fetchCheckins, insertCheckin, updateCheckin } from "../libs/db";

const app = new Hono<{ Bindings: Bindings }>();

app.post("/", async (c) => {
  const idToken = c.req.header("Authorization");
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

  const ip = getIP(c);
  const isInternal = isInternalIP(ip);
  const locationId = isInternal ? "utsukuba" : "others";
  const checkinResult = await fetchCheckins(
    userId,
    { year, month, day, hours },
    c.env.DB
  );

  // レートリミット
  const rateLimit = 100;
  if (checkinResult.reduce((acc, c) => acc + c.count, 0) >= rateLimit) {
    return c.json({ error: `Rate limit exceeded: ${rateLimit}` }, 429);
  }

  // 存在しない場合は追加
  const inLocation = checkinResult.find((c) => c.locationId === locationId);
  if (!inLocation) {
    await insertCheckin(userId, year, month, day, hours, locationId, c.env.DB);
    return;
  }

  // 存在する場合はインクリメント
  const checkinId = inLocation.id;
  const count = inLocation.count + 1;
  await updateCheckin(checkinId, count, c.env.DB);
  return c.json({ success: true }, 201);
});

export default app;
