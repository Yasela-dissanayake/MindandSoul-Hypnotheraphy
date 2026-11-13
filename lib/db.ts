import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Supabase's connection pooler closes connections that sit idle; the next query on one fails once. */
function isClosedConnection(e: unknown) {
  return (
    (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P1017") ||
    (e instanceof Error && /Server has closed the connection/i.test(e.message))
  );
}

function createClient(): PrismaClient {
  const base = new PrismaClient();
  // Retry a query once on a fresh connection instead of showing an error page.
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (e) {
          if (!isClosedConnection(e)) throw e;
          return query(args);
        }
      },
    },
  }) as unknown as PrismaClient;
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
