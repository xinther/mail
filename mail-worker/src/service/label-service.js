import orm from '../entity/orm';
import label from '../entity/label';
import emailLabel from '../entity/email-label';
import mailRule from '../entity/mail-rule';
import email from '../entity/email';
import BizError from '../error/biz-error';
import { and, asc, eq, inArray } from 'drizzle-orm';

const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const labelService = {
	async list(c, userId) {
		return orm(c).select().from(label).where(eq(label.userId, userId)).orderBy(asc(label.name)).all();
	},

	async add(c, params, userId) {
		const name = String(params.name || '').trim();
		const color = String(params.color || '#409eff').trim();
		if (!name || name.length > 30) throw new BizError('标签名称长度必须为 1-30 个字符', 400);
		if (!COLOR_PATTERN.test(color)) throw new BizError('标签颜色必须是 #RRGGBB 格式', 400);
		try {
			const row = await orm(c).insert(label).values({ userId, name, color }).returning().get();
			console.log(`[label:add] userId=${userId} labelId=${row.labelId} name=${name}`);
			return row;
		} catch (error) {
			if (String(error.message).includes('UNIQUE')) throw new BizError('标签名称已存在', 409);
			throw error;
		}
	},

	async update(c, params, userId) {
		const labelId = Number(params.labelId);
		const name = String(params.name || '').trim();
		const color = String(params.color || '').trim();
		if (!Number.isInteger(labelId) || labelId < 1) throw new BizError('无效的标签 ID', 400);
		if (!name || name.length > 30) throw new BizError('标签名称长度必须为 1-30 个字符', 400);
		if (!COLOR_PATTERN.test(color)) throw new BizError('标签颜色必须是 #RRGGBB 格式', 400);
		const row = await orm(c).update(label).set({ name, color })
			.where(and(eq(label.labelId, labelId), eq(label.userId, userId))).returning().get();
		if (!row) throw new BizError('标签不存在', 404);
		console.log(`[label:update] userId=${userId} labelId=${labelId}`);
		return row;
	},

	async delete(c, params, userId) {
		const labelId = Number(params.labelId);
		const owned = await orm(c).select({ labelId: label.labelId }).from(label)
			.where(and(eq(label.labelId, labelId), eq(label.userId, userId))).get();
		if (!owned) throw new BizError('标签不存在', 404);
		await c.env.db.batch([
			c.env.db.prepare('DELETE FROM email_label WHERE user_id = ? AND label_id = ?').bind(userId, labelId),
			c.env.db.prepare("DELETE FROM mail_rule WHERE user_id = ? AND action = 'label' AND label_id = ?").bind(userId, labelId),
			c.env.db.prepare('DELETE FROM label WHERE user_id = ? AND label_id = ?').bind(userId, labelId)
		]);
		console.log(`[label:delete] userId=${userId} labelId=${labelId}`);
	},

	async attach(c, params, userId) {
		const emailIds = this.parseEmailIds(params.emailIds);
		const labelId = Number(params.labelId);
		const [ownedLabel, ownedEmails] = await Promise.all([
			orm(c).select({ labelId: label.labelId }).from(label)
				.where(and(eq(label.labelId, labelId), eq(label.userId, userId))).get(),
			orm(c).select({ emailId: email.emailId }).from(email)
				.where(and(eq(email.userId, userId), inArray(email.emailId, emailIds))).all()
		]);
		if (!ownedLabel) throw new BizError('标签不存在', 404);
		if (ownedEmails.length !== emailIds.length) throw new BizError('邮件不存在或不属于当前用户', 404);
		await Promise.all(emailIds.map(emailId => c.env.db.prepare(
			'INSERT OR IGNORE INTO email_label(user_id, email_id, label_id) VALUES (?, ?, ?)'
		).bind(userId, emailId, labelId).run()));
		console.log(`[label:attach] userId=${userId} labelId=${labelId} emailIds=${emailIds.join(',')}`);
	},

	async detach(c, params, userId) {
		const emailIds = this.parseEmailIds(params.emailIds);
		const labelId = Number(params.labelId);
		await orm(c).delete(emailLabel).where(and(
			eq(emailLabel.userId, userId),
			eq(emailLabel.labelId, labelId),
			inArray(emailLabel.emailId, emailIds)
		)).run();
		console.log(`[label:detach] userId=${userId} labelId=${labelId} emailIds=${emailIds.join(',')}`);
	},

	parseEmailIds(value) {
		const raw = Array.isArray(value) ? value : String(value || '').split(',');
		const emailIds = [...new Set(raw.map(Number).filter(id => Number.isInteger(id) && id > 0))];
		if (!emailIds.length || emailIds.length > 50) throw new BizError('邮件 ID 数量必须为 1-50', 400);
		return emailIds;
	},

	async addLabelsToEmails(c, list) {
		const emailIds = list.map(item => item.emailId);
		if (!emailIds.length) return;
		const rows = await orm(c).select({
			emailId: emailLabel.emailId,
			labelId: label.labelId,
			name: label.name,
			color: label.color
		}).from(emailLabel).innerJoin(label, eq(label.labelId, emailLabel.labelId))
			.where(inArray(emailLabel.emailId, emailIds)).all();
		list.forEach(item => {
			item.labels = rows.filter(row => row.emailId === item.emailId)
				.map(({ labelId, name, color }) => ({ labelId, name, color }));
		});
	},

	async removeByEmailIds(c, emailIds) {
		if (emailIds.length) await orm(c).delete(emailLabel).where(inArray(emailLabel.emailId, emailIds)).run();
	},

	async removeByUserIds(c, userIds) {
		if (!userIds.length) return;
		await c.env.db.batch([
			c.env.db.prepare(`DELETE FROM email_label WHERE user_id IN (${userIds.map(() => '?').join(',')})`).bind(...userIds),
			c.env.db.prepare(`DELETE FROM mail_rule WHERE user_id IN (${userIds.map(() => '?').join(',')})`).bind(...userIds),
			c.env.db.prepare(`DELETE FROM label WHERE user_id IN (${userIds.map(() => '?').join(',')})`).bind(...userIds)
		]);
	}
};

export default labelService;
