import assert from "node:assert";
import { checkCronAuth, CRON_SECRET_HEADER } from "./cronAuth";

const SECRET = "test-cron-secret";

function h(headers: Record<string, string>) {
  return new Headers(headers);
}

function main() {
  ok("correct secret is allowed", () => {
    assert.deepStrictEqual(checkCronAuth(h({ [CRON_SECRET_HEADER]: SECRET }), SECRET), {
      ok: true,
    });
  });

  ok("wrong secret is rejected with 401", () => {
    const r = checkCronAuth(h({ [CRON_SECRET_HEADER]: "nope" }), SECRET);
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.ok === false && r.status, 401);
  });

  ok("missing header is rejected with 401", () => {
    const r = checkCronAuth(h({}), SECRET);
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.ok === false && r.status, 401);
  });

  ok("empty header value is rejected", () => {
    const r = checkCronAuth(h({ [CRON_SECRET_HEADER]: "" }), SECRET);
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.ok === false && r.status, 401);
  });

  ok("unset secret fails closed with 503 (was: allowed)", () => {
    const r = checkCronAuth(h({}), undefined);
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.ok === false && r.status, 503);
    assert.match(r.ok === false ? r.error : "", /not configured/);
  });

  ok("empty secret fails closed with 503", () => {
    const r = checkCronAuth(h({ [CRON_SECRET_HEADER]: "" }), "");
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.ok === false && r.status, 503);
  });

  ok("whitespace-only secret fails closed with 503", () => {
    const r = checkCronAuth(h({ [CRON_SECRET_HEADER]: "   " }), "   ");
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.ok === false && r.status, 503);
  });

  ok("x-vercel-cron header no longer bypasses auth", () => {
    const r = checkCronAuth(h({ "x-vercel-cron": "1" }), SECRET);
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.ok === false && r.status, 401);
  });

  ok("x-vercel-cron header cannot bypass an unset secret", () => {
    const r = checkCronAuth(h({ "x-vercel-cron": "1" }), undefined);
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.ok === false && r.status, 503);
  });

  ok("header name is matched case-insensitively, like Headers", () => {
    assert.deepStrictEqual(
      checkCronAuth(h({ "X-Kuda-Secret": SECRET }), SECRET),
      { ok: true }
    );
  });

  ok("secret is trimmed on both sides, so a padded env var still works", () => {
    assert.deepStrictEqual(
      checkCronAuth(
        h({ [CRON_SECRET_HEADER]: `  ${SECRET}  `}),
        `  ${SECRET}  `
      ),
      { ok: true }
    );
  });

  ok("padded env var still matches a verbatim header from the function", () => {
    assert.deepStrictEqual(
      checkCronAuth(h({ [CRON_SECRET_HEADER]: SECRET }), ` ${SECRET} `),
      { ok: true }
    );
  });

  ok("padding cannot smuggle in a wrong secret", () => {
    const r = checkCronAuth(h({ [CRON_SECRET_HEADER]: ` ${SECRET}x ` }), SECRET);
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.ok === false && r.status, 401);
  });

  console.log("cron-auth self-test complete");
}

function ok(name: string, fn: () => void) {
  try {
    fn();
    console.log(`ok: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}`);
    throw err;
  }
}

main();
