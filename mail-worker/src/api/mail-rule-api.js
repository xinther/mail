import app from '../hono/hono';
import mailRuleService from '../service/mail-rule-service';
import userContext from '../security/user-context';
import result from '../model/result';

app.get('/mailRule/list', async c => c.json(result.ok(await mailRuleService.list(c, userContext.getUserId(c)))));
app.post('/mailRule/add', async c => c.json(result.ok(await mailRuleService.add(c, await c.req.json(), userContext.getUserId(c)))));
app.put('/mailRule/update', async c => c.json(result.ok(await mailRuleService.update(c, await c.req.json(), userContext.getUserId(c)))));
app.delete('/mailRule/delete', async c => {
	await mailRuleService.delete(c, c.req.query(), userContext.getUserId(c));
	return c.json(result.ok());
});
