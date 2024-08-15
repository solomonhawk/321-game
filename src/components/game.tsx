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

export function Game() {
  return (
    <div className="grid place-items-center w-full h-full">
      <div className="flex flex-col gap-4">
        <OperationHeading />

        <div className="flex gap-1">
          <For each={game$.columns} item={Column} optimized />
        </div>

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
            return displayOperation(game$.currentOperation.get());
          }
        }}
      </Computed>
    </h2>
  );
}

function MoveCount() {
  return (
    <div className="text-center">
      <p className="font-bold">
        Moves: <Memo>{game$.moveCount}</Memo>
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
  const currentOperation = game$.currentOperation.get();
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
      {new Array(dimensions.y).fill(0).map((_, i) => {
        return (
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
        );
      })}
    </button>
  );
});
