import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { type User, fetchAllUsers, fetchUser } from "../libs/api";
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

const TopPage = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);

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
        {allUsers.map((user) => (
          <li key={user.id}>
            <Link to={`/@${user.screenName}`}>
              {user.name}（@{user.screenName}）
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default TopPage;
