import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { v4 as uuidv4 } from "uuid";
import { deleteCookie, getCookie } from "hono/cookie";

import { fetchUser, insertUser, updateUser } from "../libs/db";
import {
  getIdToken,
  authorizeUser,
  hashToken,
  setCookieToken,
} from "../libs/token";
import { Bindings, screenNameRegexStr } from "../libs/utils";

const app = new Hono<{ Bindings: Bindings }>();

// ユーザ情報を取得
app.get("/", async (c) => {
  const idToken = getCookie(c, "token");
  const userIdResult = await authorizeUser(idToken, c.env.DB);
  if (userIdResult.type === "error") {
    return c.json({ error: userIdResult.message }, userIdResult.status);
  }
  const user = await fetchUser(
    { type: "id", value: userIdResult.value },
    c.env.DB
  );
  if (!user) {
    return c.json({ error: "User not found", type: "USER_NOT_FOUND" }, 404);
  }
  return c.json(user);
});

// ユーザ作成
const postParamSchema = z.object({
  screenName: z.string().regex(new RegExp(`^${screenNameRegexStr}$`)),
  name: z.string(),
  message: z.string(),
  visibility: z.enum(["public", "private", "internal"]),
  listed: z.boolean(),
  displaysPast: z.boolean(),
});

app.post("/", zValidator("json", postParamSchema), async (c) => {
  const { screenName, name, message, visibility, listed, displaysPast } =
    c.req.valid("json");

  // ID の重複をチェック
  const user = await fetchUser(
    { type: "screen_name", value: screenName },
    c.env.DB
  );
  if (user) {
    return c.json(
      {
        error: "The specified ID already used",
        type: "ID_ALREADY_USED",
      },
      400
    );
  }

  const id = uuidv4();
  const token = uuidv4();
  const hashedToken = hashToken(token);
  await insertUser(
    id,
    screenName,
    name,
    message,
    visibility,
    listed,
    displaysPast,
    hashedToken,
    c.env.DB
  );

  const idToken = getIdToken(id, token);
  setCookieToken(c, idToken);
  return c.json(
    {
      id,
      screenName,
      name,
      message,
      visibility,
      listed,
      displaysPast,
      hashedToken,
      idToken,
    },
    201
  );
});

// ユーザ情報を更新
const patchParamSchema = z.object({
  screenName: z.string().regex(new RegExp(`^${screenNameRegexStr}$`)),
  name: z.string(),
  message: z.string(),
  visibility: z.enum(["public", "private", "internal"]),
  listed: z.boolean(),
  displaysPast: z.boolean(),
});

app.patch("/", zValidator("json", patchParamSchema), async (c) => {
  const idToken = getCookie(c, "token");
  const idResult = await authorizeUser(idToken, c.env.DB);
  if (idResult.type === "error") {
    return c.json({ error: idResult.message }, idResult.status);
  }
  const id = idResult.value;
  const { screenName, name, message, visibility, listed, displaysPast } =
    c.req.valid("json");

  // ID の重複をチェック
  const user = await fetchUser(
    { type: "screen_name", value: screenName },
    c.env.DB
  );
  if (user && user.id !== id) {
    return c.json(
      {
        error: "The specified ID already used",
        type: "ID_ALREADY_USED",
      },
      400
    );
  }

  await updateUser(
    id,
    {
      screenName,
      name,
      message,
      visibility,
      listed,
      displaysPast,
    },
    c.env.DB
  );
  return c.json({
    id,
    screenName,
    name,
    message,
    visibility,
    listed,
    displaysPast,
  });
});

// トークン再発行
app.get("/token", async (c) => {
  console.log("token");
  const idToken = getCookie(c, "token");
  const userIdResult = await authorizeUser(idToken, c.env.DB);
  if (userIdResult.type === "error") {
    return c.json({ error: userIdResult.message }, userIdResult.status);
  }
  const token = uuidv4();
  const hashedToken = hashToken(token);
  await updateUser(userIdResult.value, { hashedToken }, c.env.DB);

  const newIdToken = getIdToken(userIdResult.value, token);
  setCookieToken(c, newIdToken);
  return c.text(newIdToken);
});

// サインイン
app.post("/signin", async (c) => {
  const idToken = c.req.header("authorization");
  const userIdResult = await authorizeUser(idToken, c.env.DB);
  if (userIdResult.type === "error") {
    return c.json({ error: userIdResult.message }, userIdResult.status);
  }
  const user = await fetchUser(
    { type: "id", value: userIdResult.value },
    c.env.DB
  );
  if (!user) {
    return c.json({ error: "User not found", type: "USER_NOT_FOUND" }, 404);
  }
  setCookieToken(c, idToken!);
  return c.json(user);
});

// サインアウト
app.post("/signout", async (c) => {
  deleteCookie(c, "token", { secure: true });
  return c.body(null, 204);
});

export default app;
