import { v7 as uuid } from "uuid";

export function makeResumeToken(): string {
  return uuid();
}

export function makeRequestId(prefix = "req"): string {
  return `${prefix}-${uuid()}`;
}
