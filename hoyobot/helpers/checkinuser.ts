import axios from 'axios';
import { Token } from '../types';
import { buildTokenString } from './tokenator';
import { getGameURLS } from './urls';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36';

async function sendCheckInRequest(token: Token | string, game: string) {

	const strToken = buildTokenString(token);
	const message = typeof token !== 'string' ? token.discord_id : token;

	if (game === 'hsr') {
		console.log(`CHECK IN HSR: ${message}`);
		return axios({
			method: 'post',
			url: getGameURLS(game).CHECK_IN_URL,
			data: { 'act_id': 'e202303301540311' },
			headers: { 'Cookie': strToken, 'User-Agent': USER_AGENT },
		}).then((response) => {
			console.log(`RESPONSE - ${JSON.stringify(response.data)}`);
			return response.data;
		});
	}

	console.log(`CHECK IN GENSHIN: ${message}`);
	return axios({
		method: 'post',
		url: getGameURLS(game).CHECK_IN_URL,
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
