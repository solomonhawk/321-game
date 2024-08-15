import { batch, observable, ObservableObject, observe } from "@legendapp/state";

type Dimensions = {
  x: number;
  y: number;
};

type State = {
  status: "playing" | "won";
  previews: boolean;
  moveCount: number;
  dimensions: Dimensions;
  currentOperation: Operation;
  columns: Column[];
};

type Actions = {
  applyCurrentOperation(
    column: ObservableObject<Column>,
    nextColumn: Column
  ): void;
};

export type Column = { id: number; filled: number };

export const operations = ["add3", "sub2", "sub1"] as const;

export type Operation = (typeof operations)[number];

export const game$ = observable<State & Actions>({
  /**
   * State
   */
  status: "playing",
  previews: false,
  moveCount: 0,
  dimensions: {
    x: 10,
    y: 10,
  },
  currentOperation: "add3",
  columns: generateSolvableBoard({ x: 10, y: 10 }),

  /**
   * Actions
   */
  applyCurrentOperation(column: ObservableObject<Column>, nextColumn: Column) {
    const op = game$.currentOperation.get();

    batch(() => {
      column.set(nextColumn);
      game$.currentOperation.set(nextOperation(op));
      game$.moveCount.set(game$.moveCount.get() + 1);

      if (isWinningState(game$.columns.get())) {
        game$.status.set("won");
      }
    });
  },
});

function randomOperation(): Operation {
  return operations[Math.floor(Math.random() * operations.length)];
}

export function nextOperation(op: Operation): Operation {
  return operations[(operations.indexOf(op) + 1) % operations.length];
}

export function previousOperation(op: Operation): Operation {
  return operations[
    (operations.indexOf(op) + operations.length - 1) % operations.length
  ];
}

export function isWinningState(columns: Column[]) {
  return new Set(columns.map((c) => c.filled)).size === 1;
}

export function canApplyOperation(
  dimensions: Dimensions,
  column: Column,
  operation: Operation
) {
  switch (operation) {
    case "add3":
      return column.filled <= dimensions.y - 3;
    case "sub2":
      return column.filled >= 2;
    case "sub1":
      return column.filled >= 1;
  }
}

export function canApplyReverseOperation(
  dimensions: Dimensions,
  column: Column,
  operation: Operation
) {
  switch (operation) {
    case "add3":
      return column.filled >= 3;
    case "sub2":
      return column.filled <= dimensions.y - 2;
    case "sub1":
      return column.filled <= dimensions.y - 1;
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

export function applyReverseOperation(
  column: Column,
  operation: Operation
): Column {
  switch (operation) {
    case "add3":
      return { ...column, filled: column.filled - 3 };
    case "sub2":
      return { ...column, filled: column.filled + 2 };
    case "sub1":
      return { ...column, filled: column.filled + 1 };
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

/**
 * To ensure the game is solvable, we generate a random board by starting with
 * a winning state and applying operations in reverse, ensuring we finish with
 * an operation (sub1) that should be followed by the first allowed operation
 * (add3).
 */
function generateSolvableBoard({ x, y }: Dimensions): Column[] {
  let iterations = Math.max(x, 15) + Math.random() * 5;
  let operation: Operation = randomOperation();

  const initialY = Math.round(y / 2) + (-1 + Math.floor(Math.random() * 3));

  const columns = new Array(x).fill(0).map((_, i) => {
    return {
      id: i,
      filled: initialY,
    };
  });

  while (true) {
    const column = Math.floor(Math.random() * x);

    if (canApplyReverseOperation({ x, y }, columns[column], operation)) {
      columns[column] = applyReverseOperation(columns[column], operation);
      console.log("Applied operation", operation, "to column", column);
      operation = previousOperation(operation);
      iterations--;

      if (operation === "sub1" && iterations < 2) {
        break;
      }
    }
  }

  return columns;
}

observe(() => {
  console.log(game$.get());
});
