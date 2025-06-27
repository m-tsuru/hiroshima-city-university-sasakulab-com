import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { fetchUser, type User } from "../libs/api";
import HistoryMap from "./HistoryMap";
import HistoryTable from "./HistoryTable";
import useCheckin from "../libs/useCheckin";

const Main = styled.main`
  padding-top: 32px;
`;

const Header = styled.header`
  margin-bottom: 24px;
  border-bottom: solid 1px #eee;
`;

const H2 = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px 0;
`;

const H3 = styled.h3`
  font-size: 1em;
  font-weight: bold;
  margin: 24px 0 8px 0;
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
    checkins,
    thisMonthTime,
    thisMonthDays,
    thisYearTime,
    thisYearDays,
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
      } else {
        navigate("/");
      }

      setCheckins(
        [...Array(24)].flatMap((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const startHour = Math.floor(Math.random() * 20);
          const duration = Math.floor(Math.random() * 8) + 2;

          return [...Array(24)].map((_, j) => ({
            year,
            month,
            day,
            hours: j,
            count: j >= startHour && j < startHour + duration ? 1 : 0,
          }));
        })
      );
    })();
  }, [location]);

  return (
    <Main>
      <Header>
        <H2>
          {user?.name}
          <ScreenName>（@{user?.screenName}）</ScreenName>
        </H2>
        <p>{user?.message}</p>
      </Header>
      <p>現在：筑波大学 ／ その他（最終更新：2025/06/23 10:00）</p>

      <H3>いっかげつのきろく</H3>
      <P>
        今月は {thisMonthTime} 時間（{thisMonthDays} 日）大学にいました
      </P>
      <HistoryTable checkins={checkins} />

      <H3>ことしのきろく</H3>
      <P>
        今年は {thisYearTime} 時間（{thisYearDays} 日）大学にいました
      </P>
      <HistoryMap usedCheckin={usedCheckin} />
    </Main>
  );
};

export default UserPage;
