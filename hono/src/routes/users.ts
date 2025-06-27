import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import {
  Bindings,
  getIP,
  isInternalIP,
  screenNameRegexStr,
} from "../libs/utils";
import { fetchAllUsers, fetchCheckins, fetchUser } from "../libs/db";

const app = new Hono<{ Bindings: Bindings }>();

const getParamSchema = z.object({
  atScreenName: z.string().regex(new RegExp(`^@${screenNameRegexStr}$`)),
});

const isVisible = (visibility: string, ip: string) => {
  const isInternal = isInternalIP(ip);
  return visibility === "public" || (isInternal && visibility === "internal");
};

app.get("/", async (c) => {
  const users = await fetchAllUsers(c.env.DB);
  const ip = getIP(c);
  const filteredUsers = users.filter(
    (user) => user.listed && isVisible(user.visibility, ip)
  );
  return c.json(filteredUsers);
});

app.get("/:atScreenName", zValidator("param", getParamSchema), async (c) => {
  // ユーザを検索
  const { atScreenName } = c.req.valid("param");
  const screenName = atScreenName.slice(1);
  const user = await fetchUser(
    { type: "screen_name", value: screenName },
    c.env.DB
  );
  const ip = getIP(c);
  if (!user || !isVisible(user.visibility, ip)) {
    return c.json({ error: "User not found", type: "USER_NOT_FOUND" }, 404);
  }

  // チェックインを検索
  const checkins = await fetchCheckins(user.id, {}, c.env.DB);
  return c.json({ ...user, checkins });
});

export default app;
