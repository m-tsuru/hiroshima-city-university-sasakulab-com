import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { v4 as uuidv4 } from "uuid";
import { deleteCookie } from "hono/cookie";

import { fetchUser, insertUser, updateUser } from "../libs/db";
import {
  getIdToken,
  authorizeUser,
  hashToken,
  setCookieToken,
} from "../libs/token";
import { Bindings, screenNameRegexStr } from "../libs/utils";
import { authMiddleware } from "../libs/auth";

// 認証が不要なエンドポイント
export const usersMePublic = new Hono<{ Bindings: Bindings }>();

// 認証が必要なエンドポイント
export const usersMeProtected = new Hono<{
  Bindings: Bindings;
  Variables: {
    userId: string;
  };
}>();

usersMeProtected.use("/*", authMiddleware);

// ユーザ情報を取得
usersMeProtected.get("/", async (c) => {
  const userId = c.get("userId");
  const user = await fetchUser({ type: "id", value: userId }, c.env.DB);
  if (!user) {
    return c.json({ error: "User not found", type: "USER_NOT_FOUND" }, 404);
  }
  return c.json(user);
});

// ユーザを作成
const postParamSchema = z.object({
  screenName: z.string().regex(new RegExp(`^${screenNameRegexStr}$`)),
  name: z.string(),
  message: z.string(),
  visibility: z.enum(["public", "private", "internal"]),
  listed: z.boolean(),
  displaysPast: z.boolean(),
});

usersMePublic.post("/", zValidator("json", postParamSchema), async (c) => {
  const { screenName, name, message, visibility, listed, displaysPast } =
    c.req.valid("json");

  // ID の重複をチェック
  const user = await fetchUser(
    { type: "screen_name", value: screenName },
    c.env.DB
  );
  if (user) {
    return c.json(
      { error: "The specified ID already used", type: "ID_ALREADY_USED" },
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

usersMeProtected.patch("/", zValidator("json", patchParamSchema), async (c) => {
  const id = c.get("userId");
  const { screenName, name, message, visibility, listed, displaysPast } =
    c.req.valid("json");

  const user = await fetchUser(
    { type: "screen_name", value: screenName },
    c.env.DB
  );
  if (user && user.id !== id) {
    return c.json(
      { error: "The specified ID already used", type: "ID_ALREADY_USED" },
      400
    );
  }

  await updateUser(
    id,
    { screenName, name, message, visibility, listed, displaysPast },
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
usersMeProtected.get("/token", async (c) => {
  const userId = c.get("userId");
  const token = uuidv4();
  const hashedToken = hashToken(token);
  await updateUser(userId, { hashedToken }, c.env.DB);

  const newIdToken = getIdToken(userId, token);
  setCookieToken(c, newIdToken);
  return c.text(newIdToken);
});

// サインイン
usersMePublic.post("/signin", async (c) => {
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
usersMePublic.post("/signout", async (c) => {
  deleteCookie(c, "token", { secure: true });
  return c.body(null, 204);
});
