import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV == 'production' ? '.env.production' : '.env' });

const secrets = {
	BOT_SECRET: process.env.BOT_SECRET,
	CLIENT_ID: process.env.CLIENT_ID,
	WEBSITE_URL: process.env.WEBSITE_URL,
	HYV_PUBLIC_KEY: process.env.HYV_PUBLIC_KEY,
	DB_URL: process.env.DB_URL,
	DB_SECRET: process.env.DB_SECRET,
	ENV: process.env.ENV,
};

export { secrets };

