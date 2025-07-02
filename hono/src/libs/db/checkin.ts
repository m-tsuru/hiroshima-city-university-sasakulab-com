import { D1Database } from "@cloudflare/workers-types";
import { D1QB, Primitive } from "workers-qb";

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

const checkinFields: (keyof DBCheckin)[] = [
  "id",
  "year",
  "month",
  "day",
  "hours",
  "count",
  "location_id",
  "updated_at",
];

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
