import styled from "@emotion/styled";
import { css, Global } from "@emotion/react";

import AccountForm from "./AccountForm";
import PageMain from "./PageMain";
import { useEffect, useRef } from "react";

const globalStyles = css`
  * {
    font-family: "Noto Sans Mono", "Noto Sans JP", sans-serif;
    font-optical-sizing: auto;
    font-style: normal;
  }

  body {
    font-size: 15px;
    margin: 0;
    background: #fff;
    overflow: hidden;
  }
`;

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  gap: 40px;
  overflow-y: scroll;
  scroll-snap-type: y proximity;
`;

const App = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pageMainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current && pageMainRef.current) {
      wrapperRef.current.scrollTo({
        top: pageMainRef.current.offsetTop,
        behavior: "auto",
      });
    }
  }, []);

  return (
    <>
      <Global styles={globalStyles} />
      <Wrapper ref={wrapperRef}>
        <AccountForm />
        <PageMain wrapperRef={wrapperRef} ref={pageMainRef} />
      </Wrapper>
    </>
  );
};

export default App;
