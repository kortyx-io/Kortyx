import { describe, expect, it } from "vitest";
import { runWithHookContext } from "../src/context";
import { useNodeState, useWorkflowState } from "../src/hooks";
import { createNode, createState } from "./helpers";

describe("state hooks", () => {
  it("persists positional useNodeState values across runs", async () => {
    const { node } = createNode();
    const firstState = createState();

    const firstRun = await runWithHookContext(
      { node, state: firstState },
      async () => {
        const [count, setCount] = useNodeState(0);
        const [ready, setReady] = useNodeState(false);
        setCount((prev) => prev + 1);
        setReady(true);
        return { count, ready };
      },
    );

    expect(firstRun.result).toEqual({ count: 0, ready: false });
    const byIndex = (
      firstRun.runtimeUpdates as {
        __kortyx?: { nodeState?: { state?: { byIndex?: unknown[] } } };
      }
    ).__kortyx?.nodeState?.state?.byIndex;
    expect(byIndex).toEqual([1, true]);

    const secondState = createState(
      (firstRun.runtimeUpdates ?? {}) as Record<string, unknown>,
    );

    const secondRun = await runWithHookContext(
      { node, state: secondState },
      async () => {
        const [count] = useNodeState(0);
        const [ready] = useNodeState(false);
        return { count, ready };
      },
    );

    expect(secondRun.result).toEqual({ count: 1, ready: true });
  });

  it("persists object useNodeState values across runs", async () => {
    const { node } = createNode();
    const firstState = createState();

    const firstRun = await runWithHookContext(
      { node, state: firstState },
      async () => {
        const [state, setState] = useNodeState({ cursor: 0 });
        setState((prev) => ({ ...prev, cursor: prev.cursor + 2 }));
        return state.cursor;
      },
    );

    expect(firstRun.result).toBe(0);
    const byIndex = (
      firstRun.runtimeUpdates as {
        __kortyx?: {
          nodeState?: { state?: { byIndex?: unknown[] } };
        };
      }
    ).__kortyx?.nodeState?.state?.byIndex;
    expect(byIndex?.[0]).toEqual({ cursor: 2 });

    const secondState = createState(
      (firstRun.runtimeUpdates ?? {}) as Record<string, unknown>,
    );

    const secondRun = await runWithHookContext(
      { node, state: secondState },
      async () => {
        const [state] = useNodeState({ cursor: 0 });
        return state.cursor;
      },
    );

    expect(secondRun.result).toBe(2);
  });

  it("persists useWorkflowState values across runs", async () => {
    const { node } = createNode();
    const firstState = createState();

    const firstRun = await runWithHookContext(
      { node, state: firstState },
      async () => {
        const [todos, setTodos] = useWorkflowState<string[]>("todos", []);
        setTodos([...todos, "item-1"]);
        return todos;
      },
    );

    expect(firstRun.result).toEqual([]);
    const workflowState = (
      firstRun.runtimeUpdates as {
        __kortyx?: { workflowState?: Record<string, unknown> };
      }
    ).__kortyx?.workflowState;
    expect(workflowState?.todos).toEqual(["item-1"]);

    const secondState = createState(
      (firstRun.runtimeUpdates ?? {}) as Record<string, unknown>,
    );

    const secondRun = await runWithHookContext(
      { node, state: secondState },
      async () => {
        const [todos] = useWorkflowState<string[]>("todos", []);
        return todos;
      },
    );

    expect(secondRun.result).toEqual(["item-1"]);
  });
});
