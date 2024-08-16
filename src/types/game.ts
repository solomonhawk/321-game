import { ObservableObject } from "@legendapp/state";
import Rand from "rand-seed";

export type Dimensions = {
  x: number;
  y: number;
};

export type State = {
  status: "playing" | "won";
  previews: boolean;
  dimensions: Dimensions;
  undoLimit: number;
  undoCount: number;
  seed: string;
  rand: Rand;
  state: {
    moveCount: number;
    currentOperation: Operation;
    columns: Col[];
  };
};

export type Actions = {
  applyCurrentOperation(column: ObservableObject<Col>, nextColumn: Col): void;
  canUndo(): boolean;
  undoPreviousOperation(): void;
  restart(): void;
};

export type Col = { id: number; filled: number };

export const operations = ["add3", "sub2", "sub1"] as const;

export type Operation = (typeof operations)[number];
