# Founder Notes — Style Guide

The Founder Notes format is modelled on the long-form personal essays Dario Amodei
publishes on [darioamodei.com](https://darioamodei.com) — *Machines of Loving Grace*,
*The Adolescence of Technology*, *The Urgency of Interpretability*, *We Must Pace the
Frontier*.

We are borrowing a **structure and a register**, not a voice. Every post must be an
original argument about the Nigerian market, written by Craig Uwawah. Never reuse
Amodei's phrasing, examples, or metaphors.

## The ten rules

1. **Open on a paradox, and name a real misreading.** Not a contrarian hook you
   invented — a genuine confusion a reader already has. "People assume X. I assumed it
   too. Here's why it's wrong."
2. **Meta-frame before you argue.** Say why you're writing this and what you're
   deliberately skipping. One short paragraph, or a bold-lead bullet list.
3. **Lead with epistemic humility.** Say what you don't know. This is not
   throat-clearing; it's what earns the reader's trust for the rest of the piece.
4. **Show the reasoning, not just the conclusion.** Use the moves: *Why do I think
   this?* / *An obvious objection* / *Let's take these one by one.*
5. **Argue with yourself.** Build the strongest case against your own thesis, then
   answer it. Do not skip this to reach a comfortable ending.
6. **Abstraction → mechanism → human consequence.** Every claim gets all three. A
   claim about the market is worthless until you explain the mechanism and then show
   what it means for one specific person.
7. **Compress to one named phrase.** Define the idea properly, then land a short
   phrase the reader can repeat. Amodei's is *"a country of geniuses in a datacenter."*
   Yours must be earned by the preceding argument, not coined upfront.
8. **Anti-hype register.** Get quieter as the claim gets bigger. If a sentence sounds
   like a press release, rewrite it plainer. Grand claims delivered in flat sentences
   read as confidence; grand claims delivered in excited sentences read as marketing.
9. **Cross-reference your earlier notes** for continuity — "I wrote about this in
   [The WhatsApp Trap](/blog/the-whatsapp-trap)." Only when genuinely relevant.
10. **Earn the ending.** Pathos is allowed only after you've done the work. Close on
    the thesis, not on a call to action. The signup CTA is not the conclusion.

## ZEST limits

These override the above where they conflict.

- **No invented numbers.** Every figure must be real and checkable. If you don't have
  the number, write the argument without it. A hedged sentence beats a fabricated
  statistic — a wrong number in a founder's own post destroys the credibility the
  whole format depends on.
- **~1,000 words.** These are notes, not essays. Depth beats length; if it needs
  4,000 words it should be a guide instead.
- **Write like a person who runs this thing.** You built it, you talk to users, you
  make pricing decisions. That specificity is the advantage over every founder-essay
  imitator. Use it.
- **No false urgency.** No "before it's too late", no fake scarcity.
- **Nigerian specifics or it isn't a ZEST post.** Naira amounts, bank transfers,
  WhatsApp, Lagos/Ibadan/Abuja realities, how people actually pay and book.
- **Don't trash competitors by name in Founder Notes.** Guides may compare tools
  factually. Notes argue about the problem, not about rivals.

## Formatting contract

Frontmatter:

```
---
title: The actual headline
description: One sentence, used for meta and OG. Under 160 characters.
date: YYYY-MM-DD
author: Craig Uwawah
category: founder-notes
---
```

`category` must be `founder-notes` or `guides` (`lib/blog.ts`). Guides are authored
by `Zest Team`; Founder Notes by `Craig Uwawah`.

Body:

- `##` for sections. `###` sparingly. No `#` — the title comes from frontmatter.
- Bullets with a **bold lead-in**: `- **The constraint:** explanation`.
- Numbered lists for genuine sequences.
- `---` for a section break (renders as a rule).
- `<!-- cta -->` **exactly once**, on its own line, blank lines either side. Place it
  at the decision point — after the reader has the problem and sees the solution, not
  after the second heading by default.
- Tables only where a comparison is genuinely clearer as a table.
- Internal links use absolute paths: `[guide](/blog/some-post)`.

## Reference structure

The default shape of a note, adapted per post — not a template to fill in:

1. **The paradox** — the misreading, named and overturned.
2. **Why I'm writing this** — meta-framing, what I'm skipping.
3. **What I don't know** — humility, stated once, early.
4. **The argument** — the core, in sections, with the mechanism explained.
5. **The strongest objection** — argued properly, then answered.
6. **What this isn't** — the boundary of the claim.
7. **The named compression** — the repeatable phrase.
8. **The earned close** — back to the paradox, resolved.

Two examples in this style: [The WhatsApp Trap](/blog/the-whatsapp-trap) and
[Why Calendly Doesn't Work in Lagos](/blog/why-booking-tools-dont-work-in-nigeria).

## A warning about the model

Amodei's *Machines of Loving Grace* draws real criticism for a "sermonic" tone —
critics argue the language of "grace" becomes complicated and self-justifying. That
failure mode is available to us too, and it is worse for us: we charge ₦4,000 a
month. Grand register plus a business pitch reads as a trap.

The defence is rule 8. Stay concrete, stay specific, stay plain. Earn the sentiment
or cut it.
