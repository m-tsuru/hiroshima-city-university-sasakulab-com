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

interface DBCheckin {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  count: number;
  location_id: string;
  updated_at: string;
}

const userFields = [
  "id",
  "screen_name",
  "name",
  "message",
  "visibility",
  "listed",
  "displays_past",
];

const checkinFields = [
  "id",
  "year",
  "month",
  "day",
  "hours",
  "count",
  "location_id",
  "updated_at",
];

const dbToUser = (dbUser: DBUser) => ({
  id: dbUser.id,
  screenName: dbUser.screen_name,
  name: dbUser.name,
  message: dbUser.message,
  visibility: dbUser.visibility,
  listed: dbUser.listed === 1,
  displaysPast: dbUser.displays_past === 1,
});

const dbToCheckin = (dbCheckin: DBCheckin) => ({
  id: dbCheckin.id,
  year: dbCheckin.year,
  month: dbCheckin.month,
  day: dbCheckin.day,
  hours: dbCheckin.hours,
  count: dbCheckin.count,
  locationId: dbCheckin.location_id,
  updatedAt: dbCheckin.updated_at,
});

// user
export const fetchAllUsers = async (DB: D1Database) => {
  const qb = new D1QB(DB);
  const { results } = await qb
    .fetchAll<DBUser>({
      tableName: "user",
      fields: userFields,
    })
    .execute();
  if (!results) {
    return [];
  }
  return results.map(dbToUser);
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
      fields: userFields,
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
  const result = await qb
    .update({
      tableName: "user",
      data: newData,
      where: { conditions: "id = ?", params: [id] },
    })
    .execute();
};

// checkin
export const fetchCheckins = async (
  userId: string,
  options: {
    year?: number;
    month?: number;
    day?: number;
    hours?: number;
    locationId?: string;
  },
  DB: D1Database
) => {
  const qb = new D1QB(DB);
  const conditions = ["user_id = ?"];
  const params: Primitive[] = [userId];
  if (options.year !== undefined) {
    conditions.push("year = ?");
    params.push(options.year);
  }
  if (options.month !== undefined) {
    conditions.push("month = ?");
    params.push(options.month);
  }
  if (options.day !== undefined) {
    conditions.push("day = ?");
    params.push(options.day);
  }
  if (options.hours !== undefined) {
    conditions.push("hours = ?");
    params.push(options.hours);
  }
  if (options.locationId !== undefined) {
    conditions.push("location_id = ?");
    params.push(options.locationId);
  }
  const result = await qb
    .fetchAll<DBCheckin>({
      tableName: "checkin",
      fields: checkinFields,
      where: {
        conditions: conditions.join(" AND "),
        params,
      },
    })
    .execute();
  return result.results?.map(dbToCheckin) ?? [];
};

export const insertCheckin = async (
  userId: string,
  year: number,
  month: number,
  day: number,
  hours: number,
  locationId: string,
  DB: D1Database
) => {
  const qb = new D1QB(DB);
  await qb
    .insert({
      tableName: "checkin",
      data: {
        user_id: userId,
        year,
        month,
        day,
        hours,
        location_id: locationId,
        count: 1,
      },
    })
    .execute();
};

export const updateCheckin = async (
  id: number,
  count: number,
  DB: D1Database
) => {
  const qb = new D1QB(DB);
  await qb
    .update({
      tableName: "checkin",
      data: { count },
      where: { conditions: "id = ?", params: [id] },
    })
    .execute();
};
