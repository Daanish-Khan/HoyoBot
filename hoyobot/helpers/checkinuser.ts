import axios from 'axios';
import { Token } from '../types';
import { buildTokenString } from './tokenator';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36';

async function sendCheckInRequest(token: Token | string, game: string) {

	const strToken = buildTokenString(token);

	if (game === 'hsr') {
		const message = typeof token !== 'string' ? token.discord_id : token;
		console.log(`CHECK IN HSR: ${message}`);
		return axios({
			method: 'post',
			url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign',
			data: { 'act_id': 'e202303301540311' },
			headers: { 'Cookie': strToken, 'User-Agent': USER_AGENT },
		}).then((response) => {
			console.log(`RESPONSE - ${JSON.stringify(response.data)}`);
			return response.data;
		});
	}

	const message = typeof token !== 'string' ? token.discord_id : token;
	console.log(`CHECK IN GENSHIN: ${message}`);
	return axios({
		method: 'post',
		url: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign',
		params: {
			'act_id': 'e202102251931481',
			'lang': 'en-us',
		},
		headers: {
			'Cookie': strToken,
			'referer': 'https://act.hoyolab.com/',
		},
	}).then((response => {
		console.log(`RESPONSE - ${JSON.stringify(response.data)}`);
		return response.data;
	}));

}

export { sendCheckInRequest };
