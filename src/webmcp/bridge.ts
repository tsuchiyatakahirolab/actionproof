import type { Scalar } from "../core/types";

export type WebMcpTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (input: Record<string, Scalar>) => Promise<unknown> | unknown;
};

type RegisteredTool = {
  name: string;
  description: string;
  inputSchema?: string;
};

type ModelContext = {
  registerTool: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
  getTools: () => Promise<RegisteredTool[]>;
  executeTool: (
    tool: RegisteredTool,
    inputJson: string,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
};

type DocumentWithModelContext = Document & { modelContext?: ModelContext };

export type BridgeMode = "native-webmcp" | "webmcp-compatible-harness";

export type WebMcpBridge = {
  mode: BridgeMode;
  executeTool: (
    name: string,
    argumentsRecord: Record<string, Scalar>,
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
        modelContext.registerTool(tool, { signal: controller.signal }),
      ),
    );

    return {
      mode: "native-webmcp",
      executeTool: async (name, argumentsRecord) => {
        const registeredTools = await modelContext.getTools();
        const tool = registeredTools.find((candidate) => candidate.name === name);
        if (!tool) {
          throw new Error(`Native WebMCP tool ${name} is not registered.`);
        }
        return modelContext.executeTool(tool, JSON.stringify(argumentsRecord));
      },
      dispose: () => controller.abort(),
    };
  }

  const harnessTools = new Map(tools.map((tool) => [tool.name, tool]));
  return {
    mode: "webmcp-compatible-harness",
    executeTool: async (name, argumentsRecord) => {
      const tool = harnessTools.get(name);
      if (!tool) {
        throw new Error(`WebMCP harness tool ${name} is not registered.`);
      }
      return tool.execute(argumentsRecord);
    },
    dispose: () => controller.abort(),
  };
}
