import app from '../hono/hono';
import labelService from '../service/label-service';
import userContext from '../security/user-context';
import result from '../model/result';

app.get('/label/list', async c => c.json(result.ok(await labelService.list(c, userContext.getUserId(c)))));
app.post('/label/add', async c => c.json(result.ok(await labelService.add(c, await c.req.json(), userContext.getUserId(c)))));
app.put('/label/update', async c => c.json(result.ok(await labelService.update(c, await c.req.json(), userContext.getUserId(c)))));
app.delete('/label/delete', async c => {
	await labelService.delete(c, c.req.query(), userContext.getUserId(c));
	return c.json(result.ok());
});
app.post('/label/attach', async c => {
	await labelService.attach(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});
app.delete('/label/detach', async c => {
	await labelService.detach(c, c.req.query(), userContext.getUserId(c));
	return c.json(result.ok());
});
