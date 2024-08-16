import { ObservableObject } from "@legendapp/state";
import { Computed, For, Memo, observer } from "@legendapp/state/react";
import cx from "clsx";
import {
  applyOperation,
  canApplyOperation,
  type Column,
  displayOperation,
  game$,
} from "~/state/game";
import { Loop } from "./loop";
import {
  CircleBackslashIcon,
  CircleIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import { Fragment } from "react/jsx-runtime";

export function Game() {
  return (
    <div className="grid place-items-center w-full h-full">
      <div className="flex flex-col gap-4">
        <OperationHeading />

        <div className="flex gap-1">
          <For each={game$.state.columns} item={Column} optimized />
        </div>

        <Computed>
          {() => (game$.status.get() === "won" ? <Restart /> : <Undo />)}
        </Computed>
        <MoveCount />
      </div>
    </div>
  );
}

function OperationHeading() {
  return (
    <h2 className="text-center text-3xl font-bold">
      <Computed>
        {() => {
          if (game$.status.get() === "won") {
            return "You won!";
          } else {
            return displayOperation(game$.state.currentOperation.get());
          }
        }}
      </Computed>
    </h2>
  );
}

function Restart() {
  return (
    <button
      type="button"
      onClick={game$.restart}
      className="text-zinc-900 bg-green-500 border-transparent hover:bg-green-600 active:bg-green-500 text-sm border border-zinc-500 rounded-md px-2 py-1 transition-colors"
    >
      Again
    </button>
  );
}

const Undo = observer(function Undo() {
  const canUndo = game$.canUndo();
  const undoCount = game$.undoCount.get();
  const isWon = game$.status.get() === "won";

  return (
    <div className="flex gap-2 items-center justify-between">
      <button
        type="button"
        onClick={game$.undoPreviousOperation}
        disabled={!canUndo || isWon}
        className="text-zinc-100 enabled:hover:text-white enabled:hover:bg-zinc-900 enabled:active:bg-zinc-800 disabled:text-zinc-500 disabled:border-zinc-700 flex gap-1 items-center text-sm border border-zinc-500 rounded-md px-2 py-1 transition-colors"
      >
        <ResetIcon />
        Undo
      </button>

      <div className="flex items-center gap-1">
        <Loop times={game$.undoLimit.get()}>
          {(i) => (
            <Fragment key={i}>
              {i < undoCount ? (
                <CircleBackslashIcon className="size-6 text-zinc-600" />
              ) : (
                <CircleIcon className="size-6 text-green-500" />
              )}
            </Fragment>
          )}
        </Loop>
      </div>
    </div>
  );
});

function MoveCount() {
  return (
    <div className="text-center">
      <p className="font-bold">
        Moves: <Memo>{game$.state.moveCount}</Memo>
      </p>
    </div>
  );
}

const Column = observer(function Column({
  item,
}: {
  item: ObservableObject<Column>;
}) {
  const previewsEnabled = game$.previews.get();
  const dimensions = game$.dimensions.get();
  const filled = item.filled.get();
  const currentOperation = game$.state.currentOperation.get();
  const isWon = game$.status.get() === "won";
  const isEnabled =
    canApplyOperation(dimensions, item.get(), currentOperation) && !isWon;
  const nextColumnState = applyOperation(item.get(), currentOperation);

  return (
    <button
      disabled={!isEnabled}
      className="flex flex-col-reverse gap-1 group"
      onClick={() => {
        game$.applyCurrentOperation(item, nextColumnState);
      }}
    >
      <Loop times={dimensions.y}>
        {(i) => (
          <div
            key={i}
            className={cx("size-8 rounded-sm", {
              "bg-white": i < filled && !isWon,
              "bg-green-500": i < filled && isWon,
              "bg-zinc-700": i >= filled,
              "group-hover:bg-white/40":
                isEnabled &&
                previewsEnabled &&
                ((i >= filled && i < nextColumnState.filled) ||
                  (i < filled && i >= nextColumnState.filled)),
            })}
          />
        )}
      </Loop>
    </button>
  );
});
