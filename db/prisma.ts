import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Sets up WebSocket connections for Neon.
neonConfig.webSocketConstructor = ws;
const connectionString = process.env.DATABASE_URL;

// Creates a new connection pool using the provided connection string.
const pool = new Pool({ connectionString });

// Instantiates the Prisma adapter using the Neon connection pool.
const adapter = new PrismaNeon(pool);

// Extends the PrismaClient with a custom result transformer.
export const prisma = new PrismaClient({ adapter })
