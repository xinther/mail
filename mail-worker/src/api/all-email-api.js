import app from '../hono/hono';
import emailService from '../service/email-service';
import result from '../model/result';
import privacyService from '../service/privacy-service';

app.get('/allEmail/list', async (c) => {
	await privacyService.assertAdminEmailAccess(c);
	const data = await emailService.allList(c, c.req.query());
	return c.json(result.ok(data));
})

app.delete('/allEmail/delete', async (c) => {
	await privacyService.assertAdminEmailAccess(c);
	const list = await emailService.physicsDelete(c, c.req.query());
	return c.json(result.ok(list));
})

app.delete('/allEmail/batchDelete', async (c) => {
	await privacyService.assertAdminEmailAccess(c);
	await emailService.batchDelete(c, c.req.query());
	return c.json(result.ok());
})

app.get('/allEmail/latest', async (c) => {
	await privacyService.assertAdminEmailAccess(c);
	const list = await emailService.allEmailLatest(c, c.req.query());
	return c.json(result.ok(list));
})
