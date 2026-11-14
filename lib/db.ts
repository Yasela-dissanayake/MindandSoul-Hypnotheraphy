import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Worth one more try: Supabase's pooler closed an idle connection (P1017), or the network
 * dropped for a moment and the server couldn't be reached (P1001).
 */
function isClosedConnection(e: unknown) {
  return (
    (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P1017" || e.code === "P1001")) ||
    (e instanceof Prisma.PrismaClientInitializationError && e.errorCode === "P1001") ||
    (e instanceof Error && /Server has closed the connection|Can't reach database server/i.test(e.message))
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
          await new Promise((r) => setTimeout(r, 500));
          return query(args);
        }
      },
    },
  }) as unknown as PrismaClient;
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
