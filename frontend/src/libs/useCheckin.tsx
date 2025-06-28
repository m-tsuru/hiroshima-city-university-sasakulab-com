import { useMemo, useState } from "react";
import type { Checkin } from "./api";

export const isInternal = (locationId: string) => {
  return locationId === "utsukuba";
};

export const getDateKey = (year: number, month: number, day: number) => {
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
};

const useCheckin = () => {
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  const updatedAt = useMemo(() => {
    if (checkins.length === 0) {
      return "";
    }

    let latestDate: Date | null = null;
    for (const checkin of checkins) {
      const date = new Date(checkin.updatedAt);
      if (!latestDate || date > latestDate) {
        latestDate = date;
      }
    }
    const year = latestDate!.getFullYear();
    const month = (latestDate!.getMonth() + 1).toString().padStart(2, "0");
    const day = latestDate!.getDate().toString().padStart(2, "0");
    const hours = latestDate!.getHours().toString().padStart(2, "0");
    const minutes = latestDate!.getMinutes().toString().padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }, [checkins]);

  const [thisMonthTime, thisMonthDays, thisYearTime, thisYearDays] =
    useMemo(() => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;

      let monthTime = 0;
      let yearTime = 0;

      let yearDays = new Set<string>();
      let monthDays = new Set<string>();

      for (const checkin of checkins) {
        if (!isInternal(checkin.locationId) && checkin.count === 0) {
          continue;
        }
        const key = getDateKey(checkin.year, checkin.month, checkin.day);

        // 年のチェックイン
        if (checkin.year === year) {
          yearTime += 1;
          yearDays.add(key);

          // 月のチェックイン
          if (checkin.month === month) {
            monthTime += 1;
            monthDays.add(key);
          }
        }
      }
      return [monthTime, monthDays.size, yearTime, yearDays.size];
    }, [checkins]);

  const hoursByDay = useMemo(() => {
    const dict: Record<string, number> = {};

    // checkinsから一日ごとの滞在時間を集計
    for (const checkin of checkins) {
      const dateKey = getDateKey(checkin.year, checkin.month, checkin.day);
      const currentHours = dict[dateKey] ?? 0;
      if (isInternal(checkin.locationId) && checkin.count > 0) {
        dict[dateKey] = currentHours + 1;
      }
    }
    return dict;
  }, [checkins]);

  return {
    checkins,
    updatedAt,
    thisMonthTime,
    thisMonthDays,
    thisYearTime,
    thisYearDays,
    hoursByDay,
    setCheckins,
  };
};

export default useCheckin;
