import orm from '../entity/orm';
import mailRule from '../entity/mail-rule';
import label from '../entity/label';
import email from '../entity/email';
import { star } from '../entity/star';
import emailLabel from '../entity/email-label';
import BizError from '../error/biz-error';
import { emailConst, isDel } from '../const/entity-const';
import { and, asc, eq } from 'drizzle-orm';

const FIELDS = new Set(['from', 'subject', 'to']);
const OPERATORS = new Set(['contains', 'equals', 'startsWith', 'endsWith']);
const ACTIONS = new Set(['label', 'star', 'trash', 'markRead']);

const mailRuleService = {
	async list(c, userId) {
		return orm(c).select().from(mailRule).where(eq(mailRule.userId, userId))
			.orderBy(asc(mailRule.priority), asc(mailRule.ruleId)).all();
	},

	async add(c, params, userId) {
		const values = await this.validate(c, params, userId);
		const row = await orm(c).insert(mailRule).values({ ...values, userId }).returning().get();
		console.log(`[mail-rule:add] userId=${userId} ruleId=${row.ruleId} action=${row.action}`);
		return row;
	},

	async update(c, params, userId) {
		const ruleId = Number(params.ruleId);
		if (!Number.isInteger(ruleId) || ruleId < 1) throw new BizError('无效的规则 ID', 400);
		const values = await this.validate(c, params, userId);
		const row = await orm(c).update(mailRule).set(values)
			.where(and(eq(mailRule.ruleId, ruleId), eq(mailRule.userId, userId))).returning().get();
		if (!row) throw new BizError('规则不存在', 404);
		console.log(`[mail-rule:update] userId=${userId} ruleId=${ruleId}`);
		return row;
	},

	async delete(c, params, userId) {
		const ruleId = Number(params.ruleId);
		const row = await orm(c).delete(mailRule)
			.where(and(eq(mailRule.ruleId, ruleId), eq(mailRule.userId, userId))).returning().get();
		if (!row) throw new BizError('规则不存在', 404);
		console.log(`[mail-rule:delete] userId=${userId} ruleId=${ruleId}`);
	},

	async validate(c, params, userId) {
		const name = String(params.name || '').trim();
		const field = String(params.field || 'from');
		const operator = String(params.operator || 'contains');
		const value = String(params.value || '').trim();
		const action = String(params.action || 'label');
		const enabled = Number(params.enabled) === 0 ? 0 : 1;
		const priority = Number(params.priority ?? 0);
		const labelId = action === 'label' ? Number(params.labelId) : null;
		if (!name || name.length > 50) throw new BizError('规则名称长度必须为 1-50 个字符', 400);
		if (!FIELDS.has(field)) throw new BizError(`不支持的规则字段：${field}`, 400);
		if (!OPERATORS.has(operator)) throw new BizError(`不支持的匹配方式：${operator}`, 400);
		if (!value || value.length > 200) throw new BizError('匹配内容长度必须为 1-200 个字符', 400);
		if (!ACTIONS.has(action)) throw new BizError(`不支持的规则动作：${action}`, 400);
		if (!Number.isInteger(priority) || priority < 0 || priority > 999) throw new BizError('优先级必须为 0-999 的整数', 400);
		if (action === 'label') {
			const owned = await orm(c).select({ labelId: label.labelId }).from(label)
				.where(and(eq(label.labelId, labelId), eq(label.userId, userId))).get();
			if (!owned) throw new BizError('规则指定的标签不存在', 400);
		}
		return { name, field, operator, value, action, enabled, priority, labelId };
	},

	async apply(c, emailRow) {
		if (!emailRow?.userId || emailRow.status === emailConst.status.NOONE) return;
		const rules = await orm(c).select().from(mailRule).where(and(
			eq(mailRule.userId, emailRow.userId), eq(mailRule.enabled, 1)
		)).orderBy(asc(mailRule.priority), asc(mailRule.ruleId)).all();
		for (const rule of rules) {
			if (!this.matches(rule, emailRow)) continue;
			await this.execute(c, rule, emailRow);
			console.log(`[mail-rule:apply] userId=${emailRow.userId} emailId=${emailRow.emailId} ruleId=${rule.ruleId} action=${rule.action}`);
		}
	},

	matches(rule, emailRow) {
		const fields = { from: emailRow.sendEmail, subject: emailRow.subject, to: emailRow.toEmail };
		const actual = String(fields[rule.field] || '').toLocaleLowerCase();
		const expected = String(rule.value || '').toLocaleLowerCase();
		if (rule.operator === 'equals') return actual === expected;
		if (rule.operator === 'startsWith') return actual.startsWith(expected);
		if (rule.operator === 'endsWith') return actual.endsWith(expected);
		return actual.includes(expected);
	},

	async execute(c, rule, emailRow) {
		if (rule.action === 'label') {
			await orm(c).insert(emailLabel).values({
				userId: emailRow.userId, emailId: emailRow.emailId, labelId: rule.labelId
			}).onConflictDoNothing().run();
			return;
		}
		if (rule.action === 'star') {
			const exists = await orm(c).select({ starId: star.starId }).from(star).where(and(
				eq(star.userId, emailRow.userId), eq(star.emailId, emailRow.emailId)
			)).get();
			if (!exists) await orm(c).insert(star).values({ userId: emailRow.userId, emailId: emailRow.emailId }).run();
			return;
		}
		if (rule.action === 'trash') {
			await orm(c).update(email).set({ isDel: isDel.DELETE, deletedAt: new Date().toISOString() })
				.where(and(eq(email.emailId, emailRow.emailId), eq(email.userId, emailRow.userId))).run();
			return;
		}
		await orm(c).update(email).set({ unread: emailConst.unread.READ })
			.where(and(eq(email.emailId, emailRow.emailId), eq(email.userId, emailRow.userId))).run();
	}
};

export default mailRuleService;
