import React from "react";
import styled from "@emotion/styled";

import { getDateHoursKey } from "../libs/useCheckin";

const Wrapper = styled.div`
  font-size: 12px;
  display: flex;
  flex-direction: column;

  @media screen and (width < 700px) {
    font-size: 10px;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const LeftCell = styled.div`
  flex: calc(100% / 26 * 2);
  min-width: 40px;
  height: 14px;
  line-height: 14px;
`;

const Cell = styled.div`
  flex: calc(100% / 25);
  height: 14px;
  line-height: 14px;
  border-left: solid 1px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CheckedIn = styled.div<{ status: "internal" | "others" | "inactive" }>`
  width: 100%;
  height: 8px;
  background: ${({ status }) =>
    status === "internal"
      ? "hsl(25, 80%, 65%)"
      : status === "others"
      ? "#ccc"
      : "#f6f6f6"};
`;

interface HistoryTableProps {
  checkinsPerHour: Record<
    string,
    { internalCount: number; othersCount: number }
  >;
}

const HistoryMonthTable = React.memo(
  ({ checkinsPerHour }: HistoryTableProps) => {
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
                const dateHoursKey = getDateHoursKey(year, month, day, x);
                const checkin = checkinsPerHour[dateHoursKey];
                const status = checkin
                  ? checkin.internalCount > 0
                    ? "internal"
                    : "others"
                  : "inactive";
                return (
                  <Cell key={x}>
                    <CheckedIn status={status} />
                  </Cell>
                );
              })}
            </Row>
          );
        })}
      </Wrapper>
    );
  }
);

export default HistoryMonthTable;
