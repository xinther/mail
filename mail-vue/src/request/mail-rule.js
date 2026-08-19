import http from '@/axios/index.js';

export const mailRuleList = () => http.get('/mailRule/list');
export const mailRuleAdd = form => http.post('/mailRule/add', form);
export const mailRuleUpdate = form => http.put('/mailRule/update', form);
export const mailRuleDelete = ruleId => http.delete('/mailRule/delete', {params: {ruleId}});
