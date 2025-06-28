import styled from "@emotion/styled";
import { BrowserRouter, Routes, Route } from "react-router";

import UserPage from "./UserPage";

const Wrapper = styled.div`
  width: 800px;
  margin: 0 auto;
  padding-bottom: 80px;
  flex-direction: column;
  background: #fff;
  box-sizing: border-box;
  scroll-snap-align: start;
`;

const Header = styled.div`
  color: #999;
  font-size: 14px;
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
`;

const Hint = styled.p`
  margin: 0;
  cursor: pointer;

  a {
    color: inherit;
    text-decoration: none;
    text-underline-offset: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

interface PageMainProps {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  ref: React.RefObject<HTMLDivElement | null>;
}

const PageMain = ({ wrapperRef, ref }: PageMainProps) => {
  const scrollToTop = () => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Wrapper ref={ref}>
      <Header>
        <Hint>
          <a onClick={scrollToTop}>
            上にスクロールしてアカウント登録／サインイン
          </a>
        </Hint>
        <Hint>
          <a href="https://github.com/inaniwaudon/tsukuba-yokohama-dev">
            GitHub ／ 使い方
          </a>
        </Hint>
      </Header>
      <BrowserRouter>
        <Routes>
          <Route path="/:screenName" element={<UserPage />} />
        </Routes>
      </BrowserRouter>
    </Wrapper>
  );
};

export default PageMain;
