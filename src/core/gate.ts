import { cloneSnapshot, generateEffectContract, verifyEffect } from "./effect-contract.js";
import type {
  ExplicitIntent,
  Scalar,
  Snapshot,
  ToolCallRecord,
  VerificationResult,
} from "./types.js";

export type ToolExecutor = (
  name: string,
  argumentsRecord: Record<string, Scalar>,
  options?: { signal?: AbortSignal },
) => Promise<unknown>;

/**
 * The deliberately small integration boundary an owned application supplies.
 * Snapshot data must come from an application-owned source, not the tool result.
 */
export type EffectGateAdapter = {
  readIntent: () => ExplicitIntent;
  readSnapshot: () => Snapshot | Promise<Snapshot>;
};

export type EffectGateAction = {
  toolName: string;
  arguments: Record<string, Scalar>;
  execute: ToolExecutor;
};

export async function runEffectGate(input: {
  adapter: EffectGateAdapter;
  action: EffectGateAction;
  beforeSnapshot?: Snapshot;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<VerificationResult> {
  const { adapter, action, timeoutMs = 5_000 } = input;
  const before = cloneSnapshot(
    input.beforeSnapshot ?? await adapter.readSnapshot(),
  );
  const intent = structuredClone(adapter.readIntent());
  const contract = generateEffectContract(intent, before);
  let toolCall: ToolCallRecord;

  try {
    if (input.signal?.aborted) {
      throw new Error("WebMCP action aborted by the client.");
    }

    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let abortFromClient: (() => void) | undefined;
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      timeout = globalThis.setTimeout(() => {
        controller.abort();
        reject(new Error(`WebMCP action timed out after ${timeoutMs} ms.`));
      }, timeoutMs);
    });
    const clientAbortPromise = new Promise<never>((_resolve, reject) => {
      if (!input.signal) return;
      abortFromClient = () => {
        controller.abort(input.signal?.reason);
        reject(new Error("WebMCP action aborted by the client."));
      };
      input.signal.addEventListener("abort", abortFromClient, { once: true });
    });

    const result = await Promise.race([
      action.execute(action.toolName, action.arguments, {
        signal: controller.signal,
      }),
      timeoutPromise,
      clientAbortPromise,
    ]).finally(() => {
      if (timeout !== undefined) globalThis.clearTimeout(timeout);
      if (abortFromClient) {
        input.signal?.removeEventListener("abort", abortFromClient);
      }
    });

    toolCall = {
      name: action.toolName,
      arguments: structuredClone(action.arguments),
      status: "PASSED",
      result,
    };
  } catch (error) {
    toolCall = {
      name: action.toolName,
      arguments: structuredClone(action.arguments),
      status: "FAILED",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const after = cloneSnapshot(await adapter.readSnapshot());
  return verifyEffect({ intent, contract, before, after, toolCall });
}
