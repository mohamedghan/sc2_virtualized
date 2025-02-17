import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";



export const users = sqliteTable('users', {
    id: integer('id').primaryKey({autoIncrement: true}),
    username: text('username').notNull(),
    password: text('password').notNull(),
});