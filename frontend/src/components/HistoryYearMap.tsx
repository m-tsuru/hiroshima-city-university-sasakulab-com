import React, { useState } from "react";
import styled from "@emotion/styled";

import type useCheckin from "../libs/useCheckin";
import { getDateKey } from "../libs/useCheckin";

const P = styled.p`
  margin: 0 0 16px 0;
`;

const Container = styled.div`
  width: 100%;
  margin: -4px;
  padding: 4px;
  overflow-x: scroll;
  overflow-y: hidden;
`;

const Wrapper = styled.div`
  margin: -1.5px;
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  grid-template-columns: repeat(53, 1fr);
  grid-auto-flow: column;

  @media screen and (width < 600px) {
    width: 150%;
    grid-template-rows: repeat(14, 1fr);
    grid-template-columns: repeat(${Math.ceil((53 * 7) / 14)}, 1fr);
  }
`;

const Cell = styled.div<{ percentage: number }>`
  padding: 1.5px;

  div {
    width: stretch;
    aspect-ratio: 1 / 1;
    border-radius: 2px;
    background: color-mix(
      in srgb,
      hsl(25, 80%, 65%) ${({ percentage }) => percentage}%,
      #f6f6f6
    );
  }

  &:hover div {
    outline: 2px solid #999;
  }
`;

interface HistoryYearMapProps {
  usedCheckin: ReturnType<typeof useCheckin>;
}

const HistoryYearMap = React.memo(({ usedCheckin }: HistoryYearMapProps) => {
  const { thisYearTime, thisYearDays, checkinsPerDay } = usedCheckin;

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const selectedDateStr = (() => {
    if (!selectedDate) return null;
    const dateKey = getDateKey(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      selectedDate.getDate()
    );
    const dayStr = ["日", "月", "火", "水", "木", "金", "土"][
      selectedDate.getDay()
    ];
    return `${dateKey}（${dayStr}）：${
      checkinsPerDay[dateKey]?.internalHours ?? 0
    } 時間`;
  })();

  return (
    <>
      <P>
        {selectedDateStr ??
          `今年は ${thisYearTime} 時間（${thisYearDays} 日）大学にいました`}
      </P>
      <Container>
        <Wrapper>
          {[...Array(53 * 7)].map((_, i) => {
            // 今週の日曜日を始点とする
            const date = new Date();
            const dayOfWeek = date.getDay();

            date.setDate(
              date.getDate() + ((7 - dayOfWeek) % 7) - 53 * 7 + i + 1
            );
            const dateKey = getDateKey(
              date.getFullYear(),
              date.getMonth() + 1,
              date.getDate()
            );
            const percentage = Math.min(
              ((checkinsPerDay[dateKey]?.internalHours ?? 0) / 8) * 100,
              100
            );

            return (
              <Cell
                percentage={percentage}
                onMouseOver={() => setSelectedDate(date)}
                onMouseLeave={() => setSelectedDate(null)}
                key={i}
              >
                <div />
              </Cell>
            );
          })}
        </Wrapper>
      </Container>
    </>
  );
});

export default HistoryYearMap;
