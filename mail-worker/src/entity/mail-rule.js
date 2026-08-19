import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const mailRule = sqliteTable('mail_rule', {
	ruleId: integer('rule_id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	name: text('name').notNull(),
	enabled: integer('enabled').default(1).notNull(),
	priority: integer('priority').default(0).notNull(),
	field: text('field').notNull(),
	operator: text('operator').notNull(),
	value: text('value').notNull(),
	action: text('action').notNull(),
	labelId: integer('label_id'),
	createTime: text('create_time').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export default mailRule;
