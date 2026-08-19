import { describe, expect, it } from 'vitest';
import mailRuleService from '../src/service/mail-rule-service';
import labelService from '../src/service/label-service';

describe('mail rule matching', () => {
	const email = {
		sendEmail: 'alerts@example.com',
		subject: 'Your verification code',
		toEmail: 'user@example.net'
	};

	it('matches case-insensitive contains conditions', () => {
		expect(mailRuleService.matches({field: 'subject', operator: 'contains', value: 'VERIFICATION'}, email)).toBe(true);
	});

	it('supports exact and suffix matching', () => {
		expect(mailRuleService.matches({field: 'from', operator: 'equals', value: 'alerts@example.com'}, email)).toBe(true);
		expect(mailRuleService.matches({field: 'to', operator: 'endsWith', value: '@example.net'}, email)).toBe(true);
	});

	it('does not match a different sender', () => {
		expect(mailRuleService.matches({field: 'from', operator: 'startsWith', value: 'billing'}, email)).toBe(false);
	});
});

describe('email id validation', () => {
	it('normalizes and deduplicates ids', () => {
		expect(labelService.parseEmailIds('3,1,3')).toEqual([3, 1]);
	});

	it('rejects empty input instead of silently doing nothing', () => {
		expect(() => labelService.parseEmailIds('')).toThrow('邮件 ID 数量必须为 1-50');
	});
});
