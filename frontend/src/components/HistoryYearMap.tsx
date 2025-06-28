import React, { useState } from "react";
import styled from "@emotion/styled";

import type useCheckin from "../libs/useCheckin";
import { getDateKey } from "../libs/useCheckin";

const P = styled.p`
  margin: 0 0 16px 0;
`;

const Wrapper = styled.div`
  margin: -1.5px;
  display: flex;
  flex-direction: row-reverse;
`;

const Column = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column-reverse;
`;

const Cell = styled.div<{ percentage: number }>`
  aspect-ratio: 1 / 1;
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
`;

interface HistoryYearMapProps {
  usedCheckin: ReturnType<typeof useCheckin>;
}

const HistoryYearMap = React.memo(({ usedCheckin }: HistoryYearMapProps) => {
  const { thisYearTime, thisYearDays, checkinsPerDay } = usedCheckin;

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  return (
    <>
      <P>
        {selectedDateKey
          ? `${selectedDateKey}：${
              checkinsPerDay[selectedDateKey]?.internalHours ?? 0
            } 時間`
          : `今年は ${thisYearTime} 時間（${thisYearDays} 日）大学にいました`}
      </P>
      <Wrapper>
        {[...Array(53)].map((_, x) => (
          <Column key={x}>
            {[...Array(7)].map((_, y) => {
              // 今週の日曜日を始点とする
              const date = new Date();
              const dayOfWeek = date.getDay();

              date.setDate(
                date.getDate() + ((7 - dayOfWeek) % 7) - (x * 7 + y)
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
                  onMouseOver={() => setSelectedDateKey(dateKey)}
                  onMouseLeave={() => setSelectedDateKey(null)}
                  key={y}
                >
                  <div />
                </Cell>
              );
            })}
          </Column>
        ))}
      </Wrapper>
    </>
  );
});

export default HistoryYearMap;
