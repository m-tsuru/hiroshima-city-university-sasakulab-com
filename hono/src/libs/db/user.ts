import { D1Database } from "@cloudflare/workers-types";
import { D1QB, Primitive } from "workers-qb";

export type Visibility = "public" | "private" | "internal";

interface DBUser {
  id: string;
  screen_name: string;
  name: string;
  message: string;
  visibility: Visibility;
  listed: number;
  displays_past: number;
}

type DBUserWithCheckin = DBUser & {
  location_id: string;
};

interface User {
  id: string;
  screenName: string;
  name: string;
  message: string;
  visibility: Visibility;
  listed: boolean;
  displaysPast: boolean;
}

export type UserWithCheckin = User & {
  latestLocationId: string;
};

const dbUserFields: (keyof DBUser)[] = [
  "id",
  "screen_name",
  "name",
  "message",
  "visibility",
  "listed",
  "displays_past",
];

const dbToUser = (dbUser: DBUser): User => ({
  id: dbUser.id,
  screenName: dbUser.screen_name,
  name: dbUser.name,
  message: dbUser.message,
  visibility: dbUser.visibility,
  listed: dbUser.listed === 1,
  displaysPast: dbUser.displays_past === 1,
});

const dbToUserWithCheckin = (dbUser: DBUserWithCheckin): UserWithCheckin => ({
  ...dbToUser(dbUser),
  latestLocationId: dbUser.location_id,
});

// user
export const fetchAllUsers = async (
  DB: D1Database,
  checkinDate: {
    year: number;
    month: number;
    day: number;
    hours: number;
  }
) => {
  const qb = new D1QB(DB);
  const checkinConditions = [
    "count > 0",
    "checkin.year = ?",
    "checkin.month = ?",
    "checkin.day = ?",
    "checkin.hours = ?",
  ];
  const checkinParams: Primitive[] = [
    checkinDate.year,
    checkinDate.month,
    checkinDate.day,
    checkinDate.hours,
  ];

  const { results } = await qb
    .fetchAll<DBUserWithCheckin>({
      tableName: "user",
      fields: [
        ...dbUserFields.map((field) => `user.${field}`),
        "checkin.location_id",
      ],
      join: {
        type: "LEFT",
        table: {
          tableName: "checkin",
          fields: ["user_id", "count", "location_id"],
          where: {
            conditions: checkinConditions.join(" AND "),
            params: checkinParams,
          },
        },
        alias: "checkin",
        on: "user.id = checkin.user_id",
      },
      where: {
        conditions: "TRUE",
        params: checkinParams,
      },
    })
    .execute();

  if (!results) {
    return [];
  }
  return results.map(dbToUserWithCheckin);
};

export const fetchUser = async (
  { type, value }: { type: "id" | "screen_name"; value: string },
  DB: D1Database
) => {
  const qb = new D1QB(DB);
  const conditions = type === "id" ? "id = ?" : "screen_name = ?";
  const { results } = await qb
    .fetchOne<DBUser>({
      tableName: "user",
      fields: dbUserFields,
      where: { conditions, params: [value] },
    })
    .execute();
  return results ? dbToUser(results) : null;
};

export const insertUser = async (
  id: string,
  screenName: string,
  name: string,
  message: string,
  visibility: "public" | "private" | "internal",
  listed: boolean,
  displaysPast: boolean,
  hashedToken: string,
  DB: D1Database
) => {
  const qb = new D1QB(DB);
  await qb
    .insert({
      tableName: "user",
      data: {
        id,
        screen_name: screenName,
        name: name,
        message: message,
        visibility: visibility,
        listed: listed,
        displays_past: displaysPast,
        hashed_token: hashedToken,
      },
    })
    .execute();
};

export const updateUser = async (
  id: string,
  {
    screenName,
    name,
    message,
    visibility,
    listed,
    displaysPast,
    hashedToken,
  }: {
    screenName?: string;
    name?: string;
    message?: string;
    visibility?: "public" | "private" | "internal";
    listed?: boolean;
    displaysPast?: boolean;
    hashedToken?: string;
  },
  DB: D1Database
) => {
  const qb = new D1QB(DB);
  const newData: Record<string, Primitive> = {};
  if (screenName !== undefined) {
    newData.screen_name = screenName;
  }
  if (name !== undefined) {
    newData.name = name;
  }
  if (message !== undefined) {
    newData.message = message;
  }
  if (visibility !== undefined) {
    newData.visibility = visibility;
  }
  if (listed !== undefined) {
    newData.listed = listed;
  }
  if (displaysPast !== undefined) {
    newData.displays_past = displaysPast;
  }
  if (hashedToken !== undefined) {
    newData.hashed_token = hashedToken;
  }
  await qb
    .update({
      tableName: "user",
      data: newData,
      where: { conditions: "id = ?", params: [id] },
    })
    .execute();
};
