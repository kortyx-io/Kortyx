import { z } from "zod";

export const JobsStructuredData = z.object({
  jobs: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      company: z.string(),
      location: z.string(),
      match: z.number(),
    }),
  ),
  reasoning: z.string().optional(),
});

export type JobsStructuredData = z.infer<typeof JobsStructuredData>;
