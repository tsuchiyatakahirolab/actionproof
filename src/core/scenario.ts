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
  neighborId: string;
  records: EntityRecord[];
  intentSummary: string;
  actionLabel: string;
  toolName: string;
  targetArgument: string;
  toolArguments: Record<string, Scalar>;
  mutation: { field: string; value: Scalar };
  columns: Array<{ field: string; label: string }>;
};

type Listener = () => void;

export class ScenarioStore {
  readonly definition: ScenarioDefinition;
  private records: Snapshot;
  private defectEnabled = true;
  private listeners = new Set<Listener>();

  constructor(definition: ScenarioDefinition) {
    this.definition = definition;
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
    this.listeners.forEach((listener) => listener());
  }

  reset(defectEnabled = true): void {
    this.defectEnabled = defectEnabled;
    this.records = this.makeInitialSnapshot();
    this.notify();
  }

  snapshot(): Snapshot {
    return cloneSnapshot(this.records);
  }

  explicitIntent(): ExplicitIntent {
    return {
      workflowId: this.definition.id,
      resourceLabel: this.definition.resourceLabel,
      selectedIds: [this.definition.targetId],
      summary: this.definition.intentSummary,
      mutation: this.definition.mutation,
    };
  }

  executeMutation(argumentsRecord: Record<string, Scalar>): unknown {
    const argumentTarget = argumentsRecord[this.definition.targetArgument];
    if (argumentTarget !== this.definition.targetId) {
      throw new Error(
        `Tool target ${String(argumentTarget)} does not match the visible selection ${this.definition.targetId}.`,
      );
    }

    this.records[this.definition.targetId][this.definition.mutation.field] =
      this.definition.mutation.value;

    if (this.defectEnabled) {
      this.records[this.definition.neighborId][this.definition.mutation.field] =
        this.definition.mutation.value;
    }

    this.notify();
    return {
      success: true,
      requestedTarget: this.definition.targetId,
    };
  }
}

export type ToolExecutor = (
  name: string,
  argumentsRecord: Record<string, Scalar>,
) => Promise<unknown>;

export async function runActionProof(input: {
  store: ScenarioStore;
  executeTool: ToolExecutor;
}): Promise<VerificationResult> {
  const { store, executeTool } = input;
  const before = store.snapshot();
  const intent = store.explicitIntent();
  const contract = generateEffectContract(intent, before);
  let toolCall: ToolCallRecord;

  try {
    const result = await executeTool(
      store.definition.toolName,
      store.definition.toolArguments,
    );
    toolCall = {
      name: store.definition.toolName,
      arguments: store.definition.toolArguments,
      status: "PASSED",
      result,
    };
  } catch (error) {
    toolCall = {
      name: store.definition.toolName,
      arguments: store.definition.toolArguments,
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
    neighborId: "#1043",
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
    neighborId: "Bob",
    records: [
      { id: "Alice", team: "Research", role: "Viewer", status: "active" },
      { id: "Bob", team: "Research", role: "Viewer", status: "active" },
    ],
    intentSummary: "Change only Alice to Editor",
    actionLabel: "Change selected user role",
    toolName: "change_user_role",
    targetArgument: "user_id",
    toolArguments: { user_id: "Alice", role: "Editor" },
    mutation: { field: "role", value: "Editor" },
    columns: [
      { field: "team", label: "Team" },
      { field: "role", label: "Role" },
      { field: "status", label: "Status" },
    ],
  },
];
