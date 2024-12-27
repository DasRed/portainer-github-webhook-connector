import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import compress from 'koa-compress';
import config from './config.js';

const router = new Router({});

async function findWebhookIds(files) {
    const response = await fetch(`https://${config.portainer.host}/api/stacks`, {
        headers: {
            'X-API-Key': config.portainer.token,
            Accept:      'application/json'
        }
    });

    if (!response.ok) {
        return [];
    }

    const data = await response.json();

    return data.filter((stack) => files.includes(stack.EntryPoint) && stack.AutoUpdate?.Webhook).map((stack) => ({file: stack.EntryPoint, webhookId: stack.AutoUpdate?.Webhook}));
}

async function runWebhooks(body, files) {
    const webhookIds = await findWebhookIds(files);

    console.info(`Hook for files ${files.join(', ')} requested`);

    webhookIds.forEach(async ({file, webhookId}) => {
        console.info(`Running Webhook for ${file} (https://${config.portainer.host}/api/stacks/webhooks/${webhookId}).`);
        const response = await fetch(`https://${config.portainer.host}/api/stacks/webhooks/${webhookId}`, {
            headers: {
                'X-API-Key': config.portainer.token,
                Accept:      'application/json'
            },
            method:  'POST',
            body:    JSON.stringify(body)
        });

        if (!response.ok) {
            console.error(`Webhook for ${file} (https://${config.portainer.host}/api/stacks/webhooks/${webhookId}) failed.`)
        }
        else {
            console.info(`Webhook for ${file} (https://${config.portainer.host}/api/stacks/webhooks/${webhookId}) was successful.`);
        }
    });
}

router.post('/', async (ctx) => {
    ctx.status = 204;

    runWebhooks(
        ctx.request.body,
        ctx.request.body?.commits?.reduce?.((acc, commit) => acc.concat(commit?.modified ?? []), []) ?? []
    );
});

router.get('/healthcheck', async (ctx) => ctx.status = 204);

const app = new Koa();
app.use(compress())
   .use(bodyParser({jsonLimit: '20mb'}))
   .use(router.routes())
   .use(router.allowedMethods());

app.listen(config.port);
console.log(`Portainer Github Webhook Connector Server is listing at http://localhost:${config.port}`);
