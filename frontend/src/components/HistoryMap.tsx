import React from "react";
import styled from "@emotion/styled";

import type useCheckin from "../libs/useCheckin";
import { getDateKey } from "../libs/useCheckin";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
  gap: 3px;
`;

const Column = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column-reverse;
  gap: 3px;
`;

const Cell = styled.div<{ percentage: number }>`
  aspect-ratio: 1 / 1;
  background: color-mix(
    in srgb,
    hsl(25, 80%, 65%) ${({ percentage }) => percentage}%,
    #f6f6f6
  );
  border-radius: 2px;
`;

interface HistoryMapProps {
  usedCheckin: ReturnType<typeof useCheckin>;
}

const HistoryMap = React.memo(({ usedCheckin }: HistoryMapProps) => {
  const { hoursByDay } = usedCheckin;

  return (
    <Wrapper>
      {[...Array(53)].map((_, x) => (
        <Column key={x}>
          {[...Array(7)].map((_, y) => {
            // 今週の日曜日を始点とする
            const date = new Date();
            const dayOfWeek = date.getDay();

            date.setDate(date.getDate() + (7 - dayOfWeek) - (x * 7 + y));
            const dateKey = getDateKey(
              date.getFullYear(),
              date.getMonth() + 1,
              date.getDate()
            );
            const percentage = Math.min(
              ((hoursByDay[dateKey] ?? 0) / 8) * 100,
              100
            );
            return <Cell percentage={percentage} key={y} />;
          })}
        </Column>
      ))}
    </Wrapper>
  );
});

export default HistoryMap;
