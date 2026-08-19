import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { dbInit } from '../src/init/init';

describe('v3.2 D1 migration', () => {
	it('creates an idempotent searchable mailbox schema', async () => {
		await env.db.prepare(`CREATE TABLE email (
				email_id INTEGER PRIMARY KEY AUTOINCREMENT,
				subject TEXT, send_email TEXT, name TEXT, to_email TEXT, text TEXT, content TEXT,
				user_id INTEGER NOT NULL, account_id INTEGER NOT NULL, is_del INTEGER NOT NULL DEFAULT 0
			)`).run();
		await env.db.prepare(`CREATE TABLE setting (sync_delete INTEGER NOT NULL DEFAULT 1)`).run();

		const context = { env };
		await dbInit.v3_2DB(context);
		await dbInit.v3_2DB(context);

		await env.db.prepare(`INSERT INTO email
			(subject, send_email, name, to_email, text, content, user_id, account_id)
			VALUES (?, ?, ?, ?, ?, ?, 1, 1)`)
			.bind('Verification code', 'alerts@example.com', 'Alerts', 'user@example.net', 'Code 123456', '')
			.run();

		const match = await env.db.prepare(`SELECT rowid FROM email_fts WHERE email_fts MATCH ?`)
			.bind('"Verification"').first();
		expect(match.rowid).toBe(1);

		await env.db.prepare(`UPDATE email SET subject = ? WHERE email_id = 1`).bind('Updated alert').run();
		const oldMatch = await env.db.prepare(`SELECT rowid FROM email_fts WHERE email_fts MATCH ?`)
			.bind('"Verification"').first();
		const updatedMatch = await env.db.prepare(`SELECT rowid FROM email_fts WHERE email_fts MATCH ?`)
			.bind('"Updated"').first();
		expect(oldMatch).toBeNull();
		expect(updatedMatch.rowid).toBe(1);

		await env.db.prepare(`DELETE FROM email WHERE email_id = 1`).run();
		const deletedMatch = await env.db.prepare(`SELECT rowid FROM email_fts WHERE email_fts MATCH ?`)
			.bind('"Updated"').first();
		expect(deletedMatch).toBeNull();

		const tables = await env.db.prepare(`SELECT name FROM sqlite_schema WHERE type = 'table' AND name IN ('label', 'email_label', 'mail_rule')`).all();
		expect(tables.results.map(row => row.name).sort()).toEqual(['email_label', 'label', 'mail_rule']);
	});
});
