import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  createWebMcpBridge,
  detectNativeExecuteToolInputMode,
  type ModelContextWithExecution,
  type WebMcpTool,
} from "./bridge";
import type { Scalar } from "../core/types";

function fakeModelContext(mode: "object" | "json-string"): ModelContextWithExecution {
  const tools = new Map<string, WebMCP.ModelContextTool>();
  return {
    registerTool: async (tool, options) => {
      tools.set(tool.name, tool);
      options?.signal?.addEventListener("abort", () => tools.delete(tool.name), { once: true });
    },
    getTools: async () => [...tools.values()].map((tool) => ({
      ...tool,
      origin: window.location.origin,
      pageUrl: window.location.href,
      window: {} as WindowProxy,
    } as unknown as WebMCP.RegisteredTool)),
    executeTool: async (registeredTool, input) => {
      if (mode === "object" && (typeof input !== "object" || input === null)) {
        throw new TypeError("executeTool requires object input");
      }
      if (mode === "json-string" && typeof input !== "string") {
        throw new TypeError("executeTool requires JSON-string input");
      }
      const parsed = typeof input === "string"
        ? JSON.parse(input) as Record<string, Scalar>
        : input;
      const tool = tools.get(registeredTool.name);
      if (!tool) throw new Error("Tool is not registered.");
      return tool.execute(parsed, { signal: new AbortController().signal });
    },
    ontoolchange: null,
    addEventListener: () => undefined,
    dispatchEvent: () => true,
    removeEventListener: () => undefined,
  } as ModelContextWithExecution;
}

function countingModelContext(mode: "object" | "json-string") {
  const tools = new Map<string, WebMCP.ModelContextTool>();
  const executions: string[] = [];
  const context = {
    registerTool: async (tool: WebMCP.ModelContextTool, options?: { signal?: AbortSignal }) => {
      tools.set(tool.name, tool);
      options?.signal?.addEventListener("abort", () => tools.delete(tool.name), { once: true });
    },
    getTools: async () => [...tools.values()].map((tool) => ({
      ...tool,
      origin: window.location.origin,
      pageUrl: window.location.href,
      window: {} as WindowProxy,
    } as unknown as WebMCP.RegisteredTool)),
    executeTool: async (registeredTool: WebMCP.RegisteredTool, input: Record<string, Scalar> | string) => {
      executions.push(registeredTool.name);
      if (mode === "object" && (typeof input !== "object" || input === null)) {
        throw new TypeError("executeTool requires object input");
      }
      if (mode === "json-string" && typeof input !== "string") {
        throw new TypeError("executeTool requires JSON-string input");
      }
      const parsed = typeof input === "string" ? JSON.parse(input) : input;
      const tool = tools.get(registeredTool.name);
      if (!tool) throw new Error("Tool is not registered.");
      return tool.execute(parsed, { signal: new AbortController().signal });
    },
    ontoolchange: null,
    addEventListener: () => undefined,
    dispatchEvent: () => true,
    removeEventListener: () => undefined,
  } as ModelContextWithExecution;
  return { context, executions };
}

describe("native WebMCP executeTool compatibility", () => {
  beforeAll(() => {
    vi.stubGlobal("window", {
      location: { origin: "https://exactdelta.test", href: "https://exactdelta.test/" },
      setTimeout: globalThis.setTimeout,
    });
  });

  afterAll(() => vi.unstubAllGlobals());

  it.each(["object", "json-string"] as const)(
    "detects %s input without invoking an application write",
    async (mode) => {
      const context = fakeModelContext(mode);
      await expect(detectNativeExecuteToolInputMode(context)).resolves.toBe(mode);
      await expect(context.getTools()).resolves.toHaveLength(0);
    },
  );

  it.each(["object", "json-string"] as const)(
    "invokes an application write exactly once in %s mode",
    async (mode) => {
      const { context, executions } = countingModelContext(mode);
      vi.stubGlobal("document", { modelContext: context });
      const applicationTool: WebMcpTool = {
        name: "cancel_order",
        title: "Cancel order",
        description: "Test write",
        inputSchema: {
          type: "object",
          properties: { order_id: { type: "string" } },
          required: ["order_id"],
          additionalProperties: false,
        },
        execute: (input) => ({ success: true, orderId: input.order_id }),
      };

      const bridge = await createWebMcpBridge([applicationTool]);
      await expect(bridge.executeTool("cancel_order", { order_id: "#1042" })).resolves.toEqual({
        success: true,
        orderId: "#1042",
      });
      expect(executions.filter((name) => name === "cancel_order")).toHaveLength(1);
      await expect(context.getTools()).resolves.toMatchObject([{ name: "cancel_order" }]);
      bridge.dispose();
    },
  );
});
