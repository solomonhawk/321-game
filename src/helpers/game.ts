import Rand from "rand-seed";
import { Operation, operations, Col, Dimensions } from "~/types/game";

export function randomOperation(rand: Rand): Operation {
  return operations[Math.floor(rand.next() * operations.length)];
}

export function nextOperation(op: Operation): Operation {
  return operations[(operations.indexOf(op) + 1) % operations.length];
}

export function previousOperation(op: Operation): Operation {
  return operations[
    (operations.indexOf(op) + operations.length - 1) % operations.length
  ];
}

export function isWinningState(columns: Col[]) {
  return new Set(columns.map((c) => c.filled)).size === 1;
}

export function canApplyOperation(
  dimensions: Dimensions,
  column: Col,
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
  column: Col,
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

export function applyOperation(column: Col, operation: Operation): Col {
  switch (operation) {
    case "add3":
      return { ...column, filled: column.filled + 3 };
    case "sub2":
      return { ...column, filled: column.filled - 2 };
    case "sub1":
      return { ...column, filled: column.filled - 1 };
  }
}

export function applyReverseOperation(column: Col, operation: Operation): Col {
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
