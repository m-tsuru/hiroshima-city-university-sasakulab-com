import { Hono } from "hono";
import dayjs from "dayjs";

import { Bindings, getIP, isInternalIP } from "../libs/utils";
import { fetchCheckins, insertCheckin, updateCheckin } from "../libs/db";
import { authMiddleware } from "../libs/auth";

const app = new Hono<{
  Bindings: Bindings;
  Variables: {
    userId?: string;
  };
}>();

app.post("/", authMiddleware(true), async (c) => {
  const userId = c.get("userId");

  const now = dayjs().tz();
  const year = now.year();
  const month = now.month() + 1;
  const day = now.date();
  const hours = now.hour();

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
    return c.json({ count: 1 }, 201);
  }

  // 存在する場合はインクリメント
  const checkinId = inLocation.id;
  const count = inLocation.count + 1;
  await updateCheckin(checkinId, count, c.env.DB);
  return c.json({ count }, 201);
});

export default app;
