import { describe, expect, it } from "vitest";
import {
  applyStructuredChunk,
  reduceStructuredChunks,
  type StructuredStreamState,
} from "../src/structured/apply-structured-chunk";
import type { StructuredDataChunk } from "../src/types/structured-data";

type BaseChunkInput = {
  [Kind in StructuredDataChunk["kind"]]: Omit<
    Extract<StructuredDataChunk, { kind: Kind }>,
    "type" | "streamId" | "dataType"
  > & {
    streamId?: string;
    dataType?: string;
  };
}[StructuredDataChunk["kind"]];

const baseChunk = (chunk: BaseChunkInput): StructuredDataChunk =>
  ({
    type: "structured-data",
    streamId: chunk.streamId ?? "stream-1",
    dataType: chunk.dataType ?? "demo.data",
    ...chunk,
  }) as StructuredDataChunk;

describe("applyStructuredChunk", () => {
  it("supports dotted paths for nested set updates", () => {
    const state = applyStructuredChunk(
      undefined,
      baseChunk({
        kind: "set",
        path: "draft.body",
        value: "Hello",
      }),
    );

    expect(state).toMatchObject({
      streamId: "stream-1",
      dataType: "demo.data",
      status: "streaming",
      data: {
        draft: {
          body: "Hello",
        },
      },
    });
  });

  it("supports array paths, appends, text deltas, and optional metadata", () => {
    const withArray = applyStructuredChunk(
      undefined,
      baseChunk({
        kind: "set",
        path: "items.0.title",
        value: "First",
        node: "node-1",
        id: "chunk-1",
        schemaId: "schema-1",
        schemaVersion: "2026-05",
      }),
    );
    const withAppend = applyStructuredChunk(
      withArray,
      baseChunk({
        kind: "append",
        path: "tags",
        items: ["alpha"],
      }),
    );
    const withMoreAppend = applyStructuredChunk(
      withAppend,
      baseChunk({
        kind: "append",
        path: "tags",
        items: ["beta"],
      }),
    );
    const withDelta = applyStructuredChunk(
      withMoreAppend,
      baseChunk({
        kind: "text-delta",
        path: "body",
        delta: "Hello",
      }),
    );
    const withMoreDelta = applyStructuredChunk(
      withDelta,
      baseChunk({
        kind: "text-delta",
        path: "body",
        delta: " world",
      }),
    );

    expect(withArray).toMatchObject({
      node: "node-1",
      id: "chunk-1",
      schemaId: "schema-1",
      schemaVersion: "2026-05",
      data: {
        items: [{ title: "First" }],
      },
    });
    expect(withMoreDelta.data).toEqual({
      items: [{ title: "First" }],
      tags: ["alpha", "beta"],
      body: "Hello world",
    });

    expect(
      applyStructuredChunk(
        withMoreDelta,
        baseChunk({
          kind: "set",
          path: "items.1.title",
          value: "Second",
        }),
      ).data,
    ).toEqual({
      items: [{ title: "First" }, { title: "Second" }],
      tags: ["alpha", "beta"],
      body: "Hello world",
    });
  });

  it("replaces accumulated partial state when final arrives", () => {
    const partial = applyStructuredChunk(
      undefined,
      baseChunk({
        kind: "set",
        path: "draft.body",
        value: "Partial body",
      }),
    );

    const done = applyStructuredChunk(
      partial,
      baseChunk({
        kind: "final",
        data: {
          subject: "Final subject",
        },
      }),
    );

    expect(done).toMatchObject({
      status: "done",
      data: {
        subject: "Final subject",
      },
    });
    expect(done.data).not.toHaveProperty("draft");
  });

  it("throws on append applied to an existing non-array target", () => {
    const current: StructuredStreamState = {
      streamId: "stream-1",
      dataType: "demo.data",
      status: "streaming",
      data: {
        items: "not-an-array",
      },
    };

    expect(() =>
      applyStructuredChunk(
        current,
        baseChunk({
          kind: "append",
          path: "items",
          items: ["a"],
        }),
      ),
    ).toThrow('Structured append requires path "items" to target an array');
  });

  it("throws when object and array path expectations conflict", () => {
    const arrayState = applyStructuredChunk(
      undefined,
      baseChunk({
        kind: "set",
        path: "items.0",
        value: "first",
      }),
    );

    expect(() =>
      applyStructuredChunk(
        arrayState,
        baseChunk({
          kind: "set",
          path: "items.name",
          value: "bad",
        }),
      ),
    ).toThrow(
      'Structured path conflict at items for "items.name": expected object container, received array.',
    );

    const objectState = applyStructuredChunk(
      undefined,
      baseChunk({
        kind: "set",
        path: "items.name",
        value: "bad",
      }),
    );

    expect(() =>
      applyStructuredChunk(
        objectState,
        baseChunk({
          kind: "set",
          path: "items.0",
          value: "bad",
        }),
      ),
    ).toThrow(
      'Structured path conflict at items for "items.0": expected array container, received object.',
    );

    const nullState = applyStructuredChunk(
      undefined,
      baseChunk({
        kind: "set",
        path: "items",
        value: null,
      }),
    );

    expect(() =>
      applyStructuredChunk(
        nullState,
        baseChunk({
          kind: "set",
          path: "items.0",
          value: "bad",
        }),
      ),
    ).toThrow(
      'Structured path conflict at items for "items.0": expected array container, received null.',
    );
  });

  it("throws on text-delta applied to an existing non-string target", () => {
    const current: StructuredStreamState = {
      streamId: "stream-1",
      dataType: "demo.data",
      status: "streaming",
      data: {
        body: ["not-a-string"],
      },
    };

    expect(() =>
      applyStructuredChunk(
        current,
        baseChunk({
          kind: "text-delta",
          path: "body",
          delta: "hello",
        }),
      ),
    ).toThrow('Structured text-delta requires path "body" to target a string');
  });

  it("throws on invalid empty path", () => {
    expect(() =>
      applyStructuredChunk(
        undefined,
        baseChunk({
          kind: "set",
          path: "",
          value: "x",
        }),
      ),
    ).toThrow(
      "Structured chunk path must be a non-empty dot-separated string.",
    );
  });

  it("throws on invalid path segments", () => {
    expect(() =>
      applyStructuredChunk(
        undefined,
        baseChunk({
          kind: "set",
          path: "draft..body",
          value: "x",
        }),
      ),
    ).toThrow(
      'Structured chunk path "draft..body" must not contain empty segments.',
    );
  });

  it("throws on impossible nested path shape conflicts", () => {
    const current = applyStructuredChunk(
      undefined,
      baseChunk({
        kind: "set",
        path: "profile",
        value: "Mustafa",
      }),
    );

    expect(() =>
      applyStructuredChunk(
        current,
        baseChunk({
          kind: "set",
          path: "profile.name",
          value: "Mustafa",
        }),
      ),
    ).toThrow('Structured path conflict at profile for "profile.name"');
  });

  it("throws on conflicting chunk sequence at the same path", () => {
    const current = applyStructuredChunk(
      undefined,
      baseChunk({
        kind: "text-delta",
        path: "body",
        delta: "Hello",
      }),
    );

    expect(() =>
      applyStructuredChunk(
        current,
        baseChunk({
          kind: "append",
          path: "body",
          items: ["world"],
        }),
      ),
    ).toThrow('Structured append requires path "body" to target an array');
  });

  it("throws on chunks after final", () => {
    const current = applyStructuredChunk(
      undefined,
      baseChunk({
        kind: "final",
        data: { done: true },
      }),
    );

    expect(() =>
      applyStructuredChunk(
        current,
        baseChunk({
          kind: "set",
          path: "done",
          value: false,
        }),
      ),
    ).toThrow(
      "Structured stream stream-1 already completed with a final chunk.",
    );
  });

  it("throws on mismatched streamId", () => {
    const current: StructuredStreamState = {
      streamId: "stream-1",
      dataType: "demo.data",
      status: "streaming",
      data: {},
    };

    expect(() =>
      applyStructuredChunk(
        current,
        baseChunk({
          streamId: "stream-2",
          kind: "set",
          path: "body",
          value: "hello",
        }),
      ),
    ).toThrow(
      "Structured chunk streamId mismatch: expected stream-1, received stream-2.",
    );
  });

  it("reduces chunks into states keyed by stream id", () => {
    expect(
      reduceStructuredChunks([
        baseChunk({
          streamId: "stream-1",
          kind: "set",
          path: "title",
          value: "One",
        }),
        baseChunk({
          streamId: "stream-2",
          kind: "final",
          data: { title: "Two" },
        }),
      ]),
    ).toEqual({
      "stream-1": {
        streamId: "stream-1",
        dataType: "demo.data",
        status: "streaming",
        data: { title: "One" },
      },
      "stream-2": {
        streamId: "stream-2",
        dataType: "demo.data",
        status: "done",
        data: { title: "Two" },
      },
    });
  });
});
