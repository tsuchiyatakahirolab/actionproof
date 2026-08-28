import { cloneSnapshot, generateEffectContract, verifyEffect } from "./effect-contract";
import type {
  EntityRecord,
  ExplicitIntent,
  Scalar,
  Snapshot,
  ToolCallRecord,
  VerificationResult,
} from "./types";

export type ScenarioDefinition = {
  id: "orders" | "permissions";
  tabLabel: string;
  audience: string;
  resourceLabel: string;
  targetId: string;
  records: EntityRecord[];
  intentSummary: string;
  actionLabel: string;
  toolName: string;
  targetArgument: string;
  mutationArgument?: string;
  toolArguments: Record<string, Scalar>;
  mutation: { field: string; value: Scalar };
  columns: Array<{ field: string; label: string }>;
};

type Listener = () => void;

export class ScenarioStore {
  readonly definition: ScenarioDefinition;
  private records: Snapshot;
  private selectedRecordId: string;
  private defectEnabled = true;
  private listeners = new Set<Listener>();
  private version = 0;

  constructor(definition: ScenarioDefinition) {
    this.definition = definition;
    this.selectedRecordId = definition.targetId;
    this.records = this.makeInitialSnapshot();
  }

  private makeInitialSnapshot(): Snapshot {
    return Object.fromEntries(
      this.definition.records.map((record) => [record.id, { ...record }]),
    );
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify(): void {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  }

  getVersion = (): number => this.version;

  reset(defectEnabled = true): void {
    this.defectEnabled = defectEnabled;
    this.records = this.makeInitialSnapshot();
    this.notify();
  }

  snapshot(): Snapshot {
    return cloneSnapshot(this.records);
  }

  selectedId(): string {
    return this.selectedRecordId;
  }

  select(entityId: string): void {
    if (!this.records[entityId]) {
      throw new Error(`Cannot select unknown ${this.definition.resourceLabel} ${entityId}.`);
    }
    if (entityId === this.selectedRecordId) return;
    this.selectedRecordId = entityId;
    this.notify();
  }

  toolArguments(): Record<string, Scalar> {
    return {
      ...this.definition.toolArguments,
      [this.definition.targetArgument]: this.selectedRecordId,
    };
  }

  intentSummary(): string {
    return this.definition.id === "orders"
      ? `Cancel only Order ${this.selectedRecordId}`
      : `Change only ${this.selectedRecordId} to Editor`;
  }

  explicitIntent(): ExplicitIntent {
    return {
      workflowId: this.definition.id,
      resourceLabel: this.definition.resourceLabel,
      selectedIds: [this.selectedRecordId],
      summary: this.intentSummary(),
      mutation: this.definition.mutation,
    };
  }

  executeMutation(argumentsRecord: Record<string, Scalar>): unknown {
    const argumentTarget = argumentsRecord[this.definition.targetArgument];
    if (argumentTarget !== this.selectedRecordId) {
      throw new Error(
        `Tool target ${String(argumentTarget)} does not match the visible selection ${this.selectedRecordId}.`,
      );
    }

    const mutationValue = this.definition.mutationArgument
      ? argumentsRecord[this.definition.mutationArgument]
      : this.definition.mutation.value;
    if (mutationValue === undefined) {
      throw new Error(
        `Tool argument ${this.definition.mutationArgument} is required for the requested mutation.`,
      );
    }
    if (mutationValue !== this.definition.mutation.value) {
      throw new Error(
        `Tool value ${String(mutationValue)} does not match the visible intent ${String(this.definition.mutation.value)}.`,
      );
    }

    this.records[this.selectedRecordId][this.definition.mutation.field] = mutationValue;

    if (this.defectEnabled) {
      const collateralId = Object.keys(this.records).find((id) => id !== this.selectedRecordId);
      if (!collateralId) {
        throw new Error("The seeded defect requires an unselected neighboring record.");
      }
      this.records[collateralId][this.definition.mutation.field] = mutationValue;
    }

    this.notify();
    return {
      success: true,
      requestedTarget: this.selectedRecordId,
    };
  }
}

export type ToolExecutor = (
  name: string,
  argumentsRecord: Record<string, Scalar>,
  options?: { signal?: AbortSignal },
) => Promise<unknown>;

export async function runExactDelta(input: {
  store: ScenarioStore;
  executeTool: ToolExecutor;
  toolArguments?: Record<string, Scalar>;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<VerificationResult> {
  const { store, executeTool, timeoutMs = 5_000 } = input;
  const toolArguments = input.toolArguments ?? store.toolArguments();
  const before = store.snapshot();
  const intent = store.explicitIntent();
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
      timeout = globalThis.setTimeout(
        () => {
          controller.abort();
          reject(new Error(`WebMCP action timed out after ${timeoutMs} ms.`));
        },
        timeoutMs,
      );
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
      executeTool(
        store.definition.toolName,
        toolArguments,
        { signal: controller.signal },
      ),
      timeoutPromise,
      clientAbortPromise,
    ]).finally(() => {
      if (timeout !== undefined) globalThis.clearTimeout(timeout);
      if (abortFromClient) {
        input.signal?.removeEventListener("abort", abortFromClient);
      }
    });
    toolCall = {
      name: store.definition.toolName,
      arguments: toolArguments,
      status: "PASSED",
      result,
    };
  } catch (error) {
    toolCall = {
      name: store.definition.toolName,
      arguments: toolArguments,
      status: "FAILED",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const after = store.snapshot();
  return verifyEffect({ intent, contract, before, after, toolCall });
}

export const scenarioDefinitions: ScenarioDefinition[] = [
  {
    id: "orders",
    tabLabel: "Order cancellation",
    audience: "SaaS developer / QA",
    resourceLabel: "order",
    targetId: "#1042",
    records: [
      { id: "#1042", customer: "Mira Chen", total: "$84.00", status: "active" },
      { id: "#1043", customer: "Jon Bell", total: "$61.00", status: "active" },
    ],
    intentSummary: "Cancel only Order #1042",
    actionLabel: "Cancel selected order",
    toolName: "cancel_order",
    targetArgument: "order_id",
    toolArguments: { order_id: "#1042" },
    mutation: { field: "status", value: "cancelled" },
    columns: [
      { field: "customer", label: "Customer" },
      { field: "total", label: "Total" },
      { field: "status", label: "Status" },
    ],
  },
  {
    id: "permissions",
    tabLabel: "Permission change",
    audience: "SaaS developer / QA",
    resourceLabel: "user",
    targetId: "Alice",
    records: [
      { id: "Alice", team: "Research", role: "Viewer", status: "active" },
      { id: "Bob", team: "Research", role: "Viewer", status: "active" },
    ],
    intentSummary: "Change only Alice to Editor",
    actionLabel: "Change selected user role",
    toolName: "change_user_role",
    targetArgument: "user_id",
    mutationArgument: "role",
    toolArguments: { user_id: "Alice", role: "Editor" },
    mutation: { field: "role", value: "Editor" },
    columns: [
      { field: "team", label: "Team" },
      { field: "role", label: "Role" },
      { field: "status", label: "Status" },
    ],
  },
];
