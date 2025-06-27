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

const ScrollHint = styled.p`
  color: #999;
  font-size: 14px;
  margin: 16px 0 0 0;
  cursor: pointer;
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
      <ScrollHint onClick={scrollToTop}>
        上にスクロールしてアカウント登録／サインイン
      </ScrollHint>
      <BrowserRouter>
        <Routes>
          <Route path="/:screenName" element={<UserPage />} />
        </Routes>
      </BrowserRouter>
    </Wrapper>
  );
};

export default PageMain;
