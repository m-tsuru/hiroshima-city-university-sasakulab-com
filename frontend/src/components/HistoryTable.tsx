import React from "react";
import styled from "@emotion/styled";

import type { Checkin } from "../libs/api";

const Wrapper = styled.div`
  font-size: 12px;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const LeftCell = styled.div`
  flex: calc(100% / 26 * 2);
  height: 15px;
  line-height: 15px;
`;

const Cell = styled.div`
  flex: calc(100% / 25);
  height: 15px;
  line-height: 15px;
  border-left: solid 1px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CheckedIn = styled.div<{ enabled: boolean }>`
  width: 100%;
  height: 8px;
  background: ${({ enabled }) => (enabled ? "hsl(25, 80%, 65%)" : "#f6f6f6")};
`;

interface HistoryTableProps {
  checkins: Checkin[];
}

const HistoryTable = React.memo(({ checkins }: HistoryTableProps) => {
  const todayDate = new Date();

  return (
    <Wrapper>
      <Row>
        <LeftCell></LeftCell>
        {[...Array(24)].map((_, x) => (
          <Cell key={x}>{x}</Cell>
        ))}
      </Row>
      {[...Array(31)].map((_, y) => {
        const date = new Date(todayDate);
        date.setDate(todayDate.getDate() - y);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return (
          <Row key={y}>
            <LeftCell>{`${month.toString().padStart(2, "0")}/${day
              .toString()
              .padStart(2, "0")}`}</LeftCell>
            {[...Array(24)].map((_, x) => {
              const checkin = checkins.find(
                (c) =>
                  c.year === year &&
                  c.month === month &&
                  c.day === day &&
                  c.hours === x &&
                  c.locationId === "utsukuba" &&
                  c.count > 0
              );
              return (
                <Cell key={x}>
                  <CheckedIn enabled={checkin !== undefined} />
                </Cell>
              );
            })}
          </Row>
        );
      })}
    </Wrapper>
  );
});

export default HistoryTable;
