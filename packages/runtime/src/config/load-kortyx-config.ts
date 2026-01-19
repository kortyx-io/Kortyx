import { stat } from "fs/promises";
import { resolve } from "path";
import { pathToFileURL } from "url";

export interface KortyxConfig {
  workflowsDir?: string;
  fallbackWorkflowId?: string;
  registry?: {
    cache?: boolean;
    extensions?: string[];
  };
}

export interface LoadKortyxConfigOptions {
  cwd?: string;
  configPath?: string;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

export async function loadKortyxConfig(
  options: LoadKortyxConfigOptions = {},
): Promise<KortyxConfig | null> {
  const cwd = options.cwd ?? process.cwd();
  const configPath = options.configPath ?? "kortyx.config.mjs";
  const resolvedPath = resolve(cwd, configPath);

  if (!(await exists(resolvedPath))) return null;

  try {
    const mod = await import(pathToFileURL(resolvedPath).href);
    const config = (mod?.default ?? mod?.kortyx ?? mod) as KortyxConfig | null;
    if (!config || typeof config !== "object") return null;
    return config;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to load ${configPath}: ${message}`);
  }
}
