import React from "react";

export function Loop({
  times,
  children,
}: {
  times: number;
  children: (index: number) => React.ReactNode;
}) {
  return <>{Array.from({ length: times }, (_, index) => children(index))}</>;
}
