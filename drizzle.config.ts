import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/db/schema/containers.ts',
  out: './drizzle',
  dialect: 'sqlite',
});