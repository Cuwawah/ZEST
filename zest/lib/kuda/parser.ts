export interface ParsedKudaEmail {
  isFromKuda: boolean;
  isCredit: boolean;
  amountKobo: number | null;
  senderName: string | null;
  narration: string | null;
  timestamp: Date | null;
  rawBody: string;
  parseError: string | null;
}

export interface KudaEmailInput {
  messageId: string;
  from: string;
  fromName: string;
  subject: string;
  receivedAt: Date | null;
  bodyText: string;
}

const AMOUNT_RE = /(?:₦|NGN|NGN\s?[0-9]|N)\s?([\d,]+(?:\.\d{1,2})?)/i;
const AMOUNT_PLAIN_RE =
  /(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|(?<!\w)\d+\.\d{1,2}(?!\w))/;

// Kuda credit: "<Sender> just sent you ₦X,XXX.XX"
const CREDIT_AMOUNT_RE =
  /([A-Za-z0-9][A-Za-z0-9 .,'&−-]{0,120}?)\s+just sent you\s+(?:₦|NGN|N)\s?([\d,]+(?:\.\d{1,2})?)/i;

function extractSender(prefix: string): string | null {
  if (!prefix) return null;
  const cleaned = prefix
    .replace(/\btransaction notification\b/gi, " ")
    .replace(/\bthe kuda team\b/gi, " ")
    .replace(/^[^A-Za-z]+/, " ")
    .trim();
  if (!cleaned) return null;
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const name = tokens.slice(-3).join(" ");
  if (!name || !/[A-Za-z]/.test(name)) return null;
  if (name.toLowerCase().startsWith("hi ")) return null;
  return name;
}
// Kuda debit: "You just sent ₦X,XXX.XX to <Recipient>"
const DEBIT_RE = /you just sent\s+(?:₦|NGN|N)\s?[\d,]+(?:\.\d{1,2})?\s+to\b/i;
// Generic credit/debit markers (resilience for format changes)
const CREDIT_WORDS = [
  "credited",
  "credit alert",
  "incoming",
  "received",
  "just sent you",
  "just sent",
  "sent you",
];
const DEBIT_WORDS = ["debited", "debit alert", "withdrawal", "paid out"];
const NARRATION_RE =
  /(?:narration|reference|ref)\s*[:.\-]?\s*([A-Za-z0-9][A-Za-z0-9 @._#'&*|+()-]*?)(?=\s*\.\s|,|$)/i;

export function normalizeAmount(s: string): number | null {
  const cleaned = s.replace(/[, ]+/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

export function parseKudaEmail(input: KudaEmailInput): ParsedKudaEmail {
  const body = (input.bodyText || "").replace(/\r\n/g, "\n");
  const all = `${input.from} ${input.fromName} ${input.subject}\n${body}`;

  if (!/kuda/i.test(input.fromName) && !/kuda/i.test(input.from)) {
    return {
      isFromKuda: false,
      isCredit: false,
      amountKobo: null,
      senderName: null,
      narration: null,
      timestamp: input.receivedAt,
      rawBody: body,
      parseError: "not_from_kuda",
    };
  }

  // Marketing/newsletter from hello@news.kuda.com must be ignored.
  if (
    /news|times|promo|offers|more life|premium|podcast/i.test(
      input.from + " " + input.subject
    )
  ) {
    return {
      isFromKuda: true,
      isCredit: false,
      amountKobo: null,
      senderName: null,
      narration: null,
      timestamp: input.receivedAt,
      rawBody: body,
      parseError: "newsletter",
    };
  }

  const isDebit =
    DEBIT_RE.test(all) ||
    DEBIT_WORDS.some((w) => new RegExp(`\\b${w}\\b`, "i").test(all));
  const creditMatch = all.match(CREDIT_AMOUNT_RE);

  if (isDebit && !creditMatch) {
    return {
      isFromKuda: true,
      isCredit: false,
      amountKobo: null,
      senderName: null,
      narration: null,
      timestamp: input.receivedAt,
      rawBody: body,
      parseError: "debit_email",
    };
  }

  let amountKobo: number | null = null;
  let senderName: string | null = null;

  if (creditMatch) {
    amountKobo = normalizeAmount(creditMatch[2]);
    senderName = extractSender(creditMatch[1]);
  } else {
    const isCreditWord = CREDIT_WORDS.some((w) =>
      new RegExp(`\\b${w}\\b`, "i").test(all)
    );
    if (!isCreditWord && !creditMatch) {
      return {
        isFromKuda: true,
        isCredit: false,
        amountKobo: null,
        senderName: null,
        narration: null,
        timestamp: input.receivedAt,
        rawBody: body,
        parseError: "no_credit_detected",
      };
    }
    const am = all.match(AMOUNT_RE);
    if (am) amountKobo = normalizeAmount(am[1]);
    else {
      const plain = all.match(AMOUNT_PLAIN_RE);
      if (plain) amountKobo = normalizeAmount(plain[1]);
    }
  }

  if (amountKobo === null) {
    return {
      isFromKuda: true,
      isCredit: true,
      amountKobo: null,
      senderName,
      narration: null,
      timestamp: input.receivedAt,
      rawBody: body,
      parseError: "amount_not_found",
    };
  }

  const narrationMatch = all.match(NARRATION_RE);
  const narration = narrationMatch
    ? narrationMatch[1].trim().replace(/[.,;:]+$/, "")
    : null;

  return {
    isFromKuda: true,
    isCredit: true,
    amountKobo,
    senderName,
    narration,
    timestamp: input.receivedAt,
    rawBody: body,
    parseError: null,
  };
}