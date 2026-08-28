import type { Scalar } from "../core/types";

export type WebMcpTool = Omit<WebMCP.ModelContextTool, "execute"> & {
  execute: (
    input: Record<string, Scalar>,
    options: WebMCP.ToolExecuteCallbackOptions,
  ) => Promise<unknown> | unknown;
};

export type NativeExecuteToolInputMode = "object" | "json-string";

type NativeExecuteToolInput = Record<string, Scalar> | string;

export type ModelContextWithExecution = WebMCP.ModelContext & {
  executeTool: (
    tool: WebMCP.RegisteredTool,
    input: NativeExecuteToolInput,
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

const inputModeByContext = new WeakMap<object, Promise<NativeExecuteToolInputMode>>();

async function waitForProbeRemoval(
  modelContext: ModelContextWithExecution,
  probeName: string,
): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const tools = await modelContext.getTools();
    if (!tools.some((tool) => tool.name === probeName)) return;
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
  throw new Error("Native WebMCP input-mode probe did not unregister cleanly.");
}

export async function detectNativeExecuteToolInputMode(
  modelContext: ModelContextWithExecution,
): Promise<NativeExecuteToolInputMode> {
  const probeName = "exactdelta_input_mode_probe";
  const probeController = new AbortController();
  const marker = "exactdelta-probe-ok";
  const probeTool: WebMcpTool = {
    name: probeName,
    title: "ExactDelta input compatibility probe",
    description: "Read-only compatibility probe removed before application tools are exposed.",
    inputSchema: {
      type: "object",
      properties: { token: { type: "string", enum: [marker] } },
      required: ["token"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: (input) => ({ probe: input.token === marker }),
  };

  try {
    await modelContext.registerTool(probeTool as WebMCP.ModelContextTool, {
      signal: probeController.signal,
      exposedTo: [window.location.origin],
    });
    const registeredProbe = (await modelContext.getTools()).find(
      (tool) => tool.name === probeName && tool.origin === window.location.origin,
    );
    if (!registeredProbe) throw new Error("Native WebMCP input-mode probe was not discoverable.");

    try {
      await modelContext.executeTool(registeredProbe, { token: marker });
      return "object";
    } catch (objectInputError) {
      try {
        await modelContext.executeTool(registeredProbe, JSON.stringify({ token: marker }));
        return "json-string";
      } catch (jsonInputError) {
        throw new AggregateError(
          [objectInputError, jsonInputError],
          "Native WebMCP executeTool accepts neither object nor JSON-string input.",
        );
      }
    }
  } finally {
    probeController.abort();
    await waitForProbeRemoval(modelContext, probeName);
  }
}

function getNativeExecuteToolInputMode(
  modelContext: ModelContextWithExecution,
): Promise<NativeExecuteToolInputMode> {
  const cached = inputModeByContext.get(modelContext);
  if (cached) return cached;
  const detected = detectNativeExecuteToolInputMode(modelContext);
  inputModeByContext.set(modelContext, detected);
  void detected.catch(() => inputModeByContext.delete(modelContext));
  return detected;
}

export async function createWebMcpBridge(tools: WebMcpTool[]): Promise<WebMcpBridge> {
  const modelContext = (document as DocumentWithModelContext).modelContext;
  const controller = new AbortController();

  if (
    modelContext?.registerTool &&
    modelContext.getTools &&
    modelContext.executeTool
  ) {
    const inputMode = await getNativeExecuteToolInputMode(modelContext);
    try {
      await Promise.all(
        tools.map((tool) =>
          modelContext.registerTool(tool as WebMCP.ModelContextTool, {
            signal: controller.signal,
            exposedTo: [window.location.origin],
          }),
        ),
      );
    } catch (error) {
      controller.abort();
      throw error;
    }

    return {
      mode: "native-webmcp",
      executeTool: async (name, argumentsRecord, options) => {
        const registeredTools = await modelContext.getTools();
        const matchingTools = registeredTools.filter(
          (candidate) =>
            candidate.name === name && candidate.origin === window.location.origin,
        );
        if (matchingTools.length === 0) {
          throw new Error(`Native WebMCP tool ${name} is not registered.`);
        }
        if (matchingTools.length > 1) {
          throw new Error(`Native WebMCP tool ${name} is registered more than once for this origin.`);
        }
        return modelContext.executeTool(
          matchingTools[0],
          inputMode === "object" ? argumentsRecord : JSON.stringify(argumentsRecord),
          options,
        );
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
