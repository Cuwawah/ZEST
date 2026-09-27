import { compareByDateDesc, getAllPosts } from "./blog";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

const byDate = (dates: string[]) =>
  dates
    .map((date) => ({ date }))
    .sort(compareByDateDesc)
    .map((p) => p.date)
    .join(" | ");

assert(
  byDate(["September 8, 2026", "September 5, 2026", "September 27, 2026"]) ===
    "September 27, 2026 | September 8, 2026 | September 5, 2026",
  "two-digit days sort above single-digit days"
);

assert(
  byDate(["August 25, 2026", "September 2, 2026"]) ===
    "September 2, 2026 | August 25, 2026",
  "later month sorts first"
);

assert(
  byDate(["September 1, 2026", "September 2, 2026", "September 8, 2026"]) ===
    "September 8, 2026 | September 2, 2026 | September 1, 2026",
  "same month sorts by day"
);

assert(
  byDate(["December 31, 2025", "January 1, 2026"]) ===
    "January 1, 2026 | December 31, 2025",
  "cross-year ordering"
);

assert(
  byDate(["September 5, 2026", "not a date", "September 27, 2026"]) ===
    "September 27, 2026 | September 5, 2026 | not a date",
  "unparseable dates sink to the bottom instead of throwing"
);

assert(
  byDate(["2026-09-08", "September 27, 2026"]) ===
    "September 27, 2026 | 2026-09-08",
  "iso and long-form dates compare correctly together"
);

// The real content must still sort newest-first. Asserting the exact newest
// date here would break every time a post is published, so check the
// invariant and the shape of the result instead.
const posts = getAllPosts();
assert(posts.length > 0, "getAllPosts returns posts");
assert(
  posts.every((p, i) => i === 0 || new Date(posts[i - 1].date) >= new Date(p.date)),
  "getAllPosts is ordered newest first"
);
assert(
  posts.every((p) => p.date && !Number.isNaN(new Date(p.date).getTime())),
  "every post has a parseable date"
);
assert(
  new Set(posts.map((p) => p.slug)).size === posts.length,
  "post slugs are unique"
);
assert(
  posts.every((p) => p.category === "founder-notes" || p.category === "guides"),
  "every post has a valid category"
);
assert(
  new Date(posts[0].date) >= new Date("2026-09-27"),
  `newest post is dated 2026-09-27 or later (got ${posts[0].date})`
);

console.log("blog self-test complete.");
