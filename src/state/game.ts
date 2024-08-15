import { observable, observe } from "@legendapp/state";

type State = {
  status: "playing" | "won";
  moveCount: number;
  dimensions: {
    x: number;
    y: number;
  };
  currentOperation: Operation;
  columns: Column[];
};

export type Column = { id: number; filled: number };

export const operations = ["add3", "sub2", "sub1"] as const;

export type Operation = (typeof operations)[number];

export function nextOperation(op: Operation): Operation {
  return operations[(operations.indexOf(op) + 1) % operations.length];
}

export function canApplyOperation(
  state: State,
  column: Column,
  operation: Operation
) {
  switch (operation) {
    case "add3":
      return column.filled <= state.dimensions.y - 3;
    case "sub2":
      return column.filled >= 2;
    case "sub1":
      return column.filled >= 1;
  }
}

export function applyOperation(column: Column, operation: Operation): Column {
  switch (operation) {
    case "add3":
      return { ...column, filled: column.filled + 3 };
    case "sub2":
      return { ...column, filled: column.filled - 2 };
    case "sub1":
      return { ...column, filled: column.filled - 1 };
  }
}

export function displayOperation(operation: Operation) {
  switch (operation) {
    case "add3":
      return "+3";
    case "sub2":
      return "-2";
    case "sub1":
      return "-1";
  }
}

export const game$ = observable<State>({
  status: "playing",
  moveCount: 0,
  dimensions: {
    x: 3,
    y: 8,
  },
  currentOperation: "add3",
  columns: [
    { id: 0, filled: 4 },
    { id: 1, filled: 4 },
    { id: 2, filled: 4 },
  ],
});

observe(() => {
  console.log(game$.get());
});
