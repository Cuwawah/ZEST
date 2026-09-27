import { renderPost, CTA_HTML } from "./markdown";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

// Headings
const headings = renderPost("# Title\n\n## Section\n\n### Sub\n");
assert(/<h1>Title<\/h1>/.test(headings), "renders h1");
assert(/<h2>Section<\/h2>/.test(headings), "renders h2");
assert(/<h3>Sub<\/h3>/.test(headings), "renders h3");

// Lists: both bullet and ordered (ordered was previously broken)
const lists = renderPost("- one\n- two\n\n1. **first** step\n2. second step\n");
assert(/<ul>/.test(lists), "renders unordered list");
assert(lists.includes("<li>one</li>"), "renders bullet items");
assert(/<ol>/.test(lists), "renders ordered list");
assert(lists.includes("<strong>first</strong>"), "renders bold inside ordered item");
assert(lists.includes("<li>second step</li>"), "renders ordered items");

// Horizontal rule must become <hr>, not literal text
const hr = renderPost("before\n\n---\n\nafter\n");
assert(/<hr\s*\/?>/.test(hr), "renders horizontal rule as <hr>");
assert(!/<p>-{3,}<\/p>/.test(hr), "no literal --- left as text");

// GFM table
const table = renderPost(
  "| Feature | A | B |\n| --- | --- | --- |\n| Time | 5 min | 1 min |\n"
);
assert(/<table>/.test(table), "renders gfm table");
assert(/<th>Feature<\/th>/.test(table), "renders table headers");
assert(table.includes("<td>5 min</td>"), "renders table cells");

// Blockquote
const quote = renderPost("intro\n\n> A quoted line\n");
assert(/<blockquote>/.test(quote), "renders blockquote");

// Links, bold, emphasis
const inline = renderPost("[Zest](/signup) and **bold** and *italic*\n");
assert(/<a href="\/signup">Zest<\/a>/.test(inline), "renders links");
assert(/<strong>bold<\/strong>/.test(inline), "renders bold");
assert(/<em>italic<\/em>/.test(inline), "renders emphasis");

// CTA marker is opt-in and lands as block-level HTML, not inside a <p>
const withCta = renderPost("intro\n\n<!-- cta -->\n\noutro\n");
assert(withCta.includes(CTA_HTML.trim()), "cta marker injects cta block");
assert(!/<p>\s*&lt;!--/.test(withCta), "cta marker not wrapped in paragraph");
assert(!withCta.includes("<!-- cta -->"), "cta marker itself is consumed");

// Whitespace-tolerant marker
assert(
  renderPost("a\n\n<!--cta-->\n\nb\n").includes('class="inline-cta"'),
  "cta marker tolerates missing spaces"
);

// No marker means no CTA
const noCta = renderPost("## A\n\ntext\n\n## B\n\nmore text\n");
assert(!noCta.includes('class="inline-cta"'), "no cta injected without marker");

// Marker escaping is not left visible
assert(!renderPost("x\n\n<!-- cta -->\n").includes("&lt;!--"), "no escaped comment left");

console.log("markdown self-test complete.");
