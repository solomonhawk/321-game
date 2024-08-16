import { batch, observable, ObservableObject, observe } from "@legendapp/state";
import { undoRedo } from "~/helpers/undo";
import Rand from "rand-seed";
import {
  nextOperation,
  isWinningState,
  canApplyReverseOperation,
  applyReverseOperation,
  previousOperation,
  randomOperation,
} from "~/helpers/game";
import { State, Actions, Col, Dimensions, Operation } from "~/types/game";

const seedRand = new Rand(new Date().toLocaleDateString());
const initialSeed = seedRand.next().toString();
const initialRand = new Rand(initialSeed);

export const game$ = observable<State & Actions>({
  /**
   * State
   */
  status: "playing",
  previews: true,
  dimensions: {
    x: 7,
    y: 9,
  },
  undoLimit: 3,
  undoCount: 0,
  seed: initialSeed,
  rand: initialRand,
  state: {
    moveCount: 0,
    currentOperation: "add3",
    columns: generateSolvableBoard({ x: 7, y: 9 }, initialRand),
  },

  /**
   * Actions
   */
  applyCurrentOperation(column: ObservableObject<Col>, nextColumn: Col) {
    const op = game$.state.currentOperation.get();

    batch(() => {
      column.set(nextColumn);
      game$.state.currentOperation.set(nextOperation(op));
      game$.state.moveCount.set(game$.state.moveCount.get() + 1);

      if (isWinningState(game$.state.columns.get())) {
        game$.status.set("won");
      }
    });
  },

  canUndo(): boolean {
    return undos$.get() > 0 && game$.undoCount.get() < game$.undoLimit.get();
  },

  undoPreviousOperation() {
    game$.undoCount.set(game$.undoCount.get() + 1);
    undo();
  },

  restart() {
    batch(() => {
      const seed = seedRand.next().toString();
      const rand = new Rand(seed);

      game$.seed.set(seed);
      game$.rand.set(rand);
      game$.undoCount.set(0);
      game$.status.set("playing");
      game$.state.set({
        currentOperation: "add3",
        moveCount: 0,
        columns: generateSolvableBoard(game$.dimensions.get(), rand),
      });
    });

    reset();
  },
});

const { undo, undos$, reset } = undoRedo(game$.state, { limit: 3 });

/**
 * To ensure the game is solvable, we generate a random board by starting with
 * a winning state and applying operations in reverse, ensuring we finish with
 * an operation (sub1) that should be followed by the first allowed operation
 * (add3).
 */
function generateSolvableBoard({ x, y }: Dimensions, rand: Rand): Col[] {
  const minIterations = Math.max(x, 15) + rand.next() * 5;
  const colsModified = new Set();

  let iterations = 0;
  let operation: Operation = randomOperation(rand);

  const initialY = Math.round(y / 2) + (-1 + Math.floor(rand.next() * 3));

  const columns = new Array(x).fill(0).map((_, i) => {
    return {
      id: i,
      filled: initialY,
    };
  });

  while (true) {
    const column = Math.floor(rand.next() * x);

    if (canApplyReverseOperation({ x, y }, columns[column], operation)) {
      columns[column] = applyReverseOperation(columns[column], operation);
      colsModified.add(column);
      operation = previousOperation(operation);
      iterations++;

      if (
        operation === "sub1" &&
        iterations >= minIterations &&
        colsModified.size === x
      ) {
        break;
      }
    }
  }

  if (import.meta.env.DEV) {
    console.log(
      `Generated solvable board in ${iterations} iterations`,
      columns
    );
  }

  return columns;
}

observe(game$, (game) => {
  if (import.meta.env.DEV) {
    console.log(game.value);
  }
});
