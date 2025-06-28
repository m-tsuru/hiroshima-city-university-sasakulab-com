import { Hono } from "hono";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ja";

import { Bindings } from "./libs/utils";
import checkins from "./routes/checkins";
import users from "./routes/users";
import { usersMeProtected } from "./routes/usersMeProtected";
import { usersMePublic } from "./routes/usersMePublic";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");
dayjs.locale("ja");

const app = new Hono<{ Bindings: Bindings }>();

app.route("/api/checkins", checkins);
app.route("/api/users/me", usersMeProtected);
app.route("/api/users/me", usersMePublic);
app.route("/api/users", users);

app.get("/", async (c) => {
  const asset = await c.env.ASSETS.get(c.req.path);
  if (asset) {
    return c.html(asset);
  }
  return c.json({ error: "Not found" }, 404);
});

export default app;
