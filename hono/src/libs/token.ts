import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { D1QB } from "workers-qb";
import bcrypt from "bcryptjs";

import { Bindings, error, success } from "./utils";
import { D1Database } from "@cloudflare/workers-types";

export const hashToken = (token: string) => {
  return bcrypt.hashSync(token, 10);
};

export const getIdToken = (userId: string, token: string) => {
  return `${userId}:${token}`;
};

export const setCookieToken = (c: Context, idToken: string) => {
  setCookie(c, "token", idToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
};

export const authorizeUser = async (
  idToken: string | undefined,
  DB: D1Database
) => {
  const qb = new D1QB(DB);

  // トークンを検証
  if (!idToken) {
    return error("Token not found", 401);
  }
  const split = idToken.split(":");
  if (split.length !== 2) {
    return error("Invalid token", 401);
  }
  const userId = split[0];
  const token = split[1];

  // ユーザを検索
  const userResult = await qb
    .fetchOne<{ hashed_token: string }>({
      tableName: "user",
      fields: ["id", "hashed_token"],
      where: {
        conditions: "id = ?",
        params: [userId],
      },
    })
    .execute();
  if (!userResult.results) {
    return error("Invalid token", 401);
  }

  // トークンを検証
  const hashedToken = userResult.results.hashed_token;
  if (!bcrypt.compareSync(token, hashedToken)) {
    return error("Invalid token", 401);
  }
  return success(userId);
};
