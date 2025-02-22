import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import {users} from "./users"


export const containers = sqliteTable('containers', {
    id: text('id').primaryKey().notNull(),
    owner: integer("owner").references(() => users.id),
});