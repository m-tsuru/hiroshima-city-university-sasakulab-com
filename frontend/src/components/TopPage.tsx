import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { type UserWithLatestCheckin, fetchAllUsers } from "../libs/api";
import { StatusCircle } from "./utils";

const Header = styled.header`
  margin-bottom: 24px;
`;

const H3 = styled.h3`
  font-size: 1em;
  margin: 24px 0 0 0;
`;

const TopPage = () => {
  const [allUsers, setAllUsers] = useState<UserWithLatestCheckin[]>([]);

  useEffect(() => {
    (async () => {
      const result = await fetchAllUsers();
      if (result.type === "success") {
        setAllUsers(result.value);
      }
    })();
  }, [location]);

  return (
    <main>
      <Header>アイコン画像を入れたい</Header>
      <H3>みんなのきろく</H3>
      <ul>
        {allUsers.map((user) => {
          const status =
            user.latestLocationId === "utsukuba"
              ? "internal"
              : user.latestLocationId === "others"
              ? "others"
              : "inactive";
          return (
            <li key={user.id}>
              <Link to={`/@${user.screenName}`}>
                <StatusCircle status={status} />
                {user.name}（@{user.screenName}） 現在：
                {user.latestLocationId ?? "不明"}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
};

export default TopPage;
