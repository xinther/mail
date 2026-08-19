import { sqliteTable, integer } from 'drizzle-orm/sqlite-core';

export const emailLabel = sqliteTable('email_label', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	emailId: integer('email_id').notNull(),
	labelId: integer('label_id').notNull()
});

export default emailLabel;
