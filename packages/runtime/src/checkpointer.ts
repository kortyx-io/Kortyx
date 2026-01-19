import { MemorySaver } from "@langchain/langgraph";

const map = new Map<string, MemorySaver>();

export function getCheckpointer(key: string): MemorySaver {
  const k = key || "__default__";
  let saver = map.get(k);
  if (!saver) {
    saver = new MemorySaver();
    map.set(k, saver);
  }
  return saver;
}
