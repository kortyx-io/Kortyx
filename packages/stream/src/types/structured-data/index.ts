import { z } from "zod";
import { JobsStructuredData } from "./jobs";
// import { ProfileStructuredData } from "./profile"; // future use

/**
 * Define all known structured data chunk schemas.
 * Each one discriminates on `dataType` so we can infer its shape.
 */
export const StructuredDataChunkSchema = z.discriminatedUnion("dataType", [
  z.object({
    type: z.literal("structured-data"),
    dataType: z.literal("jobs"),
    node: z.string().optional(),
    data: JobsStructuredData,
  }),

  // Future additions:
  // z.object({
  //   type: z.literal("structured-data"),
  //   dataType: z.literal("profile"),
  //   node: z.string().optional(),
  //   data: ProfileStructuredData,
  // }),
]);

export type StructuredDataChunk = z.infer<typeof StructuredDataChunkSchema>;
