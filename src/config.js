import 'dotenv/config';

export default {
    port: 6000,
    portainer: {
        host: process.env.PGWC_PORTAINER_HOST ?? 'portainer.dasred.de',
        token: process.env.PGWC_PORTAINER_TOKEN
    }
};
