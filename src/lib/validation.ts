import { z } from "zod";
import { BOARD_CITIES, CATEGORIES, TIERS, USER_STATUSES, VISIBILITIES } from "@/db/enums";
import { cigars, DRINKS } from "@/lib/data";

export const LIMITS = { post: 2000, comment: 1000, reason: 500, third: 160 } as const;

const third = z.string().trim().max(LIMITS.third, `Keep each note under ${LIMITS.third} characters.`);

export const postInputSchema = z
  .object({
    body: z.string().trim().max(LIMITS.post, `Posts can be up to ${LIMITS.post} characters.`),
    category: z.enum(CATEGORIES),
    city: z.enum(BOARD_CITIES),
    visibility: z.enum(VISIBILITIES),
    cigarId: z.string().trim().max(80).optional(),
    session: z
      .object({
        rating: z.number().int().min(1).max(5),
        thirds: z.tuple([third, third, third]),
        pairing: z.string().trim().refine((p) => DRINKS.includes(p), "Pick a pairing from the list."),
      })
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (v.cigarId && !cigars.some((c) => c.id === v.cigarId)) {
      ctx.addIssue({ code: "custom", path: ["cigarId"], message: "That cigar is not in the club catalog." });
    }
    if (v.category === "smoke_session") {
      if (!v.session) ctx.addIssue({ code: "custom", path: ["session"], message: "Add a rating to log a Smoke Session." });
      if (!v.cigarId) ctx.addIssue({ code: "custom", path: ["cigarId"], message: "Pick the cigar you smoked." });
    } else if (v.body.length === 0) {
      ctx.addIssue({ code: "custom", path: ["body"], message: "Write something to post." });
    }
  });
export type PostInput = z.infer<typeof postInputSchema>;

export const commentSchema = z.object({
  postId: z.uuid(),
  body: z.string().trim().min(1, "Write a reply first.").max(LIMITS.comment, `Replies can be up to ${LIMITS.comment} characters.`),
});

export const reportSchema = z
  .object({
    postId: z.uuid().optional(),
    commentId: z.uuid().optional(),
    reason: z.string().trim().min(3, "Tell the hosts what's wrong.").max(LIMITS.reason),
  })
  .refine((v) => (v.postId ? 1 : 0) + (v.commentId ? 1 : 0) === 1, "Report a post or a reply.");

export const idSchema = z.uuid();
export const tierSchema = z.enum(TIERS);
export const statusSchema = z.enum(USER_STATUSES);

export function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Something in that form isn't right.";
}
