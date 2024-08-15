import { batch, ObservableObject } from "@legendapp/state";
import { For, Memo, useSelector } from "@legendapp/state/react";
import cx from "clsx";
import {
  applyOperation,
  canApplyOperation,
  type Column,
  displayOperation,
  game$,
  nextOperation,
} from "~/state/game";

// function Row({ item }) {
//   return <div>{item.text}</div>;
// }
// export function Game() {
//   // 1. Use the For component with an item prop
//   return <For each={state$.arr} item={Row} />;

//   // 2. Use the For component with a render function as the child
//   // return (
//   //     <For each={list}>
//   //         {item => (
//   //             <div>
//   //                 {item.text}
//   //             </div>
//   //         )}
//   //     </div>
//   // )
// }

export function Game() {
  return (
    <div className="grid place-items-center w-full h-full">
      <div className="flex flex-col gap-4">
        <OperationHeading />

        <div className="flex gap-1">
          <For each={game$.columns} item={Column} />
        </div>

        <MoveCount />
      </div>
    </div>
  );
}

function OperationHeading() {
  const currentOperation = useSelector(() => game$.currentOperation.get());

  return (
    <h2 className="text-center text-3xl font-bold">
      {displayOperation(currentOperation)}
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

function Column({ item }: { item: ObservableObject<Column> }) {
  const height = useSelector(() => game$.dimensions.y.get());
  const filled = useSelector(() => item.filled.get());
  const currentOperation = useSelector(() => game$.currentOperation.get());
  const isEnabled = useSelector(() =>
    canApplyOperation(game$.get(), item.get(), currentOperation)
  );
  const nextColumnPreview = useSelector(() =>
    applyOperation(item.get(), currentOperation)
  );

  return (
    <button
      disabled={!isEnabled}
      className="flex flex-col-reverse gap-1 group"
      onClick={() => {
        batch(() => {
          item.set(applyOperation(item.get(), currentOperation));
          game$.currentOperation.set(nextOperation(currentOperation));
          game$.moveCount.set(game$.moveCount.get() + 1);
        });
      }}
    >
      {new Array(height).fill(0).map((_, i) => {
        return (
          <div
            key={i}
            className={cx("size-8 rounded-sm", {
              "bg-white": i < filled,
              "bg-zinc-500": i >= filled,
              "group-hover:bg-white/70":
                isEnabled &&
                ((i >= filled && i < nextColumnPreview.filled) ||
                  (i < filled && i >= nextColumnPreview.filled)),
            })}
          />
        );
      })}
    </button>
  );
}
