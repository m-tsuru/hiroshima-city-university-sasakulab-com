import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";

import { fetchAllUsers, fetchCheckins, fetchUser } from "../libs/db";
import { authMiddleware } from "../libs/token";
import {
  Bindings,
  getIP,
  getNow,
  isInternalIP,
  screenNameRegexStr,
} from "../libs/utils";

const app = new Hono<{ Bindings: Bindings }>();

const getParamSchema = z.object({
  atScreenName: z.string().regex(new RegExp(`^@${screenNameRegexStr}$`)),
});

const isVisible = (visibility: string, ip: string) => {
  const isInternal = isInternalIP(ip);
  return visibility === "public" || (isInternal && visibility === "internal");
};

app.get("/", async (c) => {
  const { year, month, day, hours } = getNow();
  const users = await fetchAllUsers(c.env.DB, {
    year,
    month,
    day,
    hours,
  });
  const ip = getIP(c);
  const filteredUsers = users.filter((user) => isVisible(user.visibility, ip));
  return c.json(filteredUsers);
});

app.get(
  "/:atScreenName",
  authMiddleware(false, "cookie"),
  zValidator("param", getParamSchema),
  async (c) => {
    const userId = c.get("userId");

    // ユーザを検索
    const { atScreenName } = c.req.valid("param");
    const screenName = atScreenName.slice(1);
    const user = await fetchUser(
      { type: "screen_name", value: screenName },
      c.env.DB
    );
    if (!user) {
      return c.json({ error: "User not found", type: "USER_NOT_FOUND" }, 404);
    }

    const authorized = userId === user.id;
    if (!authorized && !isVisible(user.visibility, getIP(c))) {
      return c.json({ error: "Forbidden", type: "FORBIDDEN" }, 403);
    }

    // チェックインを検索
    const { year, month, day, hours } = getNow();
    const options = user.displaysPast ? {} : { year, month, day, hours };
    const checkins = await fetchCheckins(user.id, options, c.env.DB);
    return c.json({ ...user, checkins });
  }
);

export default app;
