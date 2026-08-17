import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import type { PoolConfig } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 2000;

function createClient(): PrismaClient {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL || "",
  } satisfies PoolConfig);
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}

function isRetryableError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  const low = msg.toLowerCase();
  return (
    low.includes("p1001") ||
    low.includes("can't reach database server") ||
    low.includes("connection") ||
    low.includes("econnrefused") ||
    low.includes("etimedout") ||
    low.includes("timed out") ||
    low.includes("timeout") ||
    low.includes("terminating connection") ||
    low.includes("connection closed") ||
    low.includes("fetch failed") ||
    low.includes("error event")
  );
}

async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await run();
    } catch (err) {
      lastErr = err;
      if (!isRetryableError(err)) throw err;
      globalForPrisma.prisma = createClient();
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      }
    }
  }
  throw lastErr;
}

type AnyDelegate = Record<string | symbol, unknown>;
type AnyFn = (...args: unknown[]) => Promise<unknown>;

function wrapClient(): PrismaClient {
  const proxy = new Proxy({} as PrismaClient, {
    get(_, prop) {
      if (prop === "then") return undefined;
      const client = getPrisma();
      const value = (client as unknown as AnyDelegate)[prop];
      if (typeof value === "function") {
        return (...args: unknown[]) =>
          withRetry(async () => {
            const c = getPrisma();
            const fn = (c as unknown as AnyDelegate)[prop] as AnyFn;
            return fn.apply(c, args);
          });
      }
      if (value && typeof value === "object") {
        return new Proxy(value as AnyDelegate, {
          get(_t, method) {
            const v = (value as AnyDelegate)[method];
            if (typeof v === "function") {
              return (...args: unknown[]) =>
                withRetry(async () => {
                  const c = getPrisma();
                  const delegate = (c as unknown as AnyDelegate)[prop] as AnyDelegate;
                  const fn = delegate[method] as AnyFn;
                  return fn.apply(delegate, args);
                });
            }
            return v;
          },
        });
      }
      return value;
    },
  });
  return proxy;
}

export const prisma: PrismaClient = wrapClient();
