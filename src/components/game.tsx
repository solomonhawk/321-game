import { ObservableObject } from "@legendapp/state";
import {
  Computed,
  For,
  Memo,
  observer,
  Reactive,
  useObserveEffect,
} from "@legendapp/state/react";
import {
  CircleBackslashIcon,
  CircleIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import cx from "clsx";
import { motion, stagger, transform, useAnimate } from "framer-motion";
import { Fragment } from "react/jsx-runtime";
import {
  applyOperation,
  canApplyOperation,
  displayOperation,
} from "~/helpers/game";
import { game$ } from "~/state/game";
import { Col } from "~/types/game";
import { Loop } from "./loop";

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

        <Seed />
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
      className="text-zinc-900 bg-green-500 border-transparent hover:bg-green-600 active:bg-green-500 text-sm border rounded-md px-2 py-1 transition-colors"
    >
      Again
    </button>
  );
}

function Undo() {
  return (
    <div className="flex gap-2 items-center justify-between">
      <Reactive.button
        type="button"
        onClick={game$.undoPreviousOperation}
        $disabled={() => !game$.canUndo() || game$.status.get() === "won"}
        className="text-zinc-100 enabled:hover:text-white enabled:hover:bg-zinc-900 enabled:active:bg-zinc-800 disabled:text-zinc-500 disabled:border-zinc-700 flex gap-1 items-center text-sm border border-zinc-500 rounded-md px-2 py-1 transition-colors"
      >
        <ResetIcon />
        Undo
      </Reactive.button>

      <div className="flex items-center gap-1">
        <Memo>
          {() => {
            const undoCount = game$.undoCount.get();

            return (
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
            );
          }}
        </Memo>
      </div>
    </div>
  );
}

function MoveCount() {
  return (
    <div className="text-center">
      <p className="font-bold">
        Moves: <Memo>{game$.state.moveCount}</Memo>
      </p>
    </div>
  );
}

function Seed() {
  return (
    <p className="text-center text-xs text-zinc-500">
      <Computed>{() => game$.seed.get().replace(/^0\./, "")}</Computed>
    </p>
  );
}

const Column = observer(function Column({
  id,
  item,
}: {
  id: string;
  item: ObservableObject<Col>;
}) {
  const previewsEnabled = game$.previews.get();
  const dimensions = game$.dimensions.get();
  const middle = Math.floor(dimensions.x / 2);
  const filled = item.filled.get();
  const currentOperation = game$.state.currentOperation.get();
  const isWon = game$.status.get() === "won";
  const isEnabled =
    canApplyOperation(dimensions, item.get(), currentOperation) && !isWon;
  const nextColumnState = applyOperation(item.get(), currentOperation);

  const [scope, animate] = useAnimate();

  useObserveEffect(() => {
    game$.status.onChange(async ({ value }) => {
      if (value === "won") {
        await animate(
          ".box",
          {
            scale: 1,
            rotate: 90,
          },
          {
            type: "spring",
            velocity: -5,
            bounce: 0.5,
            delay: stagger(0.05, {
              startDelay: transform(
                Math.abs(Number(id) - middle),
                [0, middle],
                [0, middle / 20]
              ),
              from: "center",
            }),
          }
        );

        animate(".box", { rotate: 0 }, { duration: 0 });
      }
    });
  });

  return (
    <button
      ref={scope}
      disabled={!isEnabled}
      className="flex flex-col-reverse gap-1 group"
      onClick={() => {
        game$.applyCurrentOperation(item, nextColumnState);
      }}
    >
      <Loop times={dimensions.y}>
        {(i) => (
          <motion.div
            key={i}
            className={cx("box size-8 rounded-sm transition-colors", {
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
