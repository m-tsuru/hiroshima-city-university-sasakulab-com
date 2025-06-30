import styled from "@emotion/styled";

export const StatusCircle = styled.span<{
  status: "internal" | "others" | "inactive";
}>`
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
