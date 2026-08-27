import type { Scalar } from "../core/types";

export type WebMcpTool = Omit<WebMCP.ModelContextTool, "execute"> & {
  execute: (
    input: Record<string, Scalar>,
    options: WebMCP.ToolExecuteCallbackOptions,
  ) => Promise<unknown> | unknown;
};

type ModelContextWithExecution = WebMCP.ModelContext & {
  executeTool: (
    tool: WebMCP.RegisteredTool,
    inputJson: string,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
};

type DocumentWithModelContext = Document & { modelContext?: ModelContextWithExecution };

export type BridgeMode = "native-webmcp" | "webmcp-compatible-harness";

export type WebMcpBridge = {
  mode: BridgeMode;
  executeTool: (
    name: string,
    argumentsRecord: Record<string, Scalar>,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
  dispose: () => void;
};

export async function createWebMcpBridge(tools: WebMcpTool[]): Promise<WebMcpBridge> {
  const modelContext = (document as DocumentWithModelContext).modelContext;
  const controller = new AbortController();

  if (
    modelContext?.registerTool &&
    modelContext.getTools &&
    modelContext.executeTool
  ) {
    await Promise.all(
      tools.map((tool) =>
        modelContext.registerTool(tool as WebMCP.ModelContextTool, {
          signal: controller.signal,
          exposedTo: [window.location.origin],
        }),
      ),
    );

    return {
      mode: "native-webmcp",
      executeTool: async (name, argumentsRecord, options) => {
        const registeredTools = await modelContext.getTools();
        const tool = registeredTools.find((candidate) => candidate.name === name);
        if (!tool) {
          throw new Error(`Native WebMCP tool ${name} is not registered.`);
        }
        return modelContext.executeTool(tool, JSON.stringify(argumentsRecord), options);
      },
      dispose: () => controller.abort(),
    };
  }

  const harnessTools = new Map(tools.map((tool) => [tool.name, tool]));
  return {
    mode: "webmcp-compatible-harness",
    executeTool: async (name, argumentsRecord, options) => {
      const tool = harnessTools.get(name);
      if (!tool) {
        throw new Error(`WebMCP harness tool ${name} is not registered.`);
      }
      const signal = options?.signal ?? new AbortController().signal;
      if (signal.aborted) throw new DOMException("WebMCP action aborted.", "AbortError");
      return tool.execute(argumentsRecord, { signal });
    },
    dispose: () => controller.abort(),
  };
}
