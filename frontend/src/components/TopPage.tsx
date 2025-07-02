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

const ListLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  display: block;
  padding: 4px 0;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
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
          const statusText =
            status === "internal"
              ? "筑波大学"
              : status === "others"
              ? "学外"
              : "不明";
          return (
            <li key={user.id}>
              <ListLink to={`/@${user.screenName}`}>
                <StatusCircle status={status} />
                {user.name}（@{user.screenName}） 現在：
                {statusText}
              </ListLink>
            </li>
          );
        })}
      </ul>
    </main>
  );
};

export default TopPage;
