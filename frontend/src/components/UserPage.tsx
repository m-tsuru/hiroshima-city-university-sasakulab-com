import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { type User, fetchUser } from "../libs/api";
import HistoryYearMap from "./HistoryYearMap";
import HistoryMonthTable from "./HistoryMonthTable";
import useCheckin, { isInternal } from "../libs/useCheckin";

const Header = styled.header`
  margin-bottom: 24px;
`;

const H2 = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
`;

const Message = styled.p`
  margin: 0 0 8px 0;
`;

const Status = styled.p`
  width: 100%;
  margin: 0;
  padding-left: 22px;
  white-space: nowrap;
  overflow: hidden;
`;

const Circle = styled.span<{ status: "internal" | "others" | "inactive" }>`
  width: 14px;
  height: 14px;
  vertical-align: middle;
  margin: 0 8px 4px -22px;
  display: inline-block;
  border-radius: 50%;
  background: ${({ status }) =>
    status === "internal"
      ? "hsl(25, 80%, 65%)"
      : status === "others"
      ? "#ccc"
      : "#ccc"};
`;

const LastUpdate = styled.span`
  color: #666;
`;

const H3 = styled.h3`
  font-size: 1em;
  margin: 24px 0 0 0;
`;

const ScreenName = styled.span`
  font-weight: normal;
`;

const P = styled.p`
  margin: 0 0 16px 0;
`;

const UserPage = () => {
  const { screenName } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const usedCheckin = useCheckin();
  const {
    lastCheckin,
    thisMonthTime,
    thisMonthDays,
    checkinsPerHour,
    setCheckins,
  } = usedCheckin;

  useEffect(() => {
    (async () => {
      if (!screenName || !screenName.startsWith("@")) {
        return;
      }
      const user = await fetchUser(screenName.slice(1));
      if (user.type === "success") {
        setUser(user.value);
        setCheckins(user.value.checkins);
      } else {
        navigate("/");
      }
    })();
  }, [location]);

  return (
    <main>
      <Header>
        <H2>
          {user?.name}
          <ScreenName>（@{user?.screenName}）</ScreenName>
        </H2>
        <Message>{user?.message}</Message>
        <Status>
          {lastCheckin ? (
            lastCheckin.active ? (
              <>
                <Circle
                  status={
                    isInternal(lastCheckin.location) ? "internal" : "others"
                  }
                />
                現在：
                {isInternal(lastCheckin.location) ? "筑波大学" : "その他"}
                <br />
                <LastUpdate>最終更新：{lastCheckin.date}</LastUpdate>
              </>
            ) : (
              <>
                <Circle status="inactive" />
                現在：不明
                <br />
                <LastUpdate>
                  最終更新：
                  {isInternal(lastCheckin.location)
                    ? "筑波大学"
                    : "その他"} ／ {lastCheckin.date}
                </LastUpdate>
              </>
            )
          ) : (
            <>
              <Circle status="inactive" />
              記録なし
            </>
          )}
        </Status>
      </Header>

      <H3>いっかげつのきろく</H3>
      <P>
        今月は {thisMonthTime} 時間（{thisMonthDays} 日）大学にいました
      </P>
      <HistoryMonthTable checkinsPerHour={checkinsPerHour} />

      <H3>ことしのきろく</H3>
      <HistoryYearMap usedCheckin={usedCheckin} />
    </main>
  );
};

export default UserPage;
