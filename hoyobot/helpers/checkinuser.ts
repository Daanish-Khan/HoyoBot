import axios from 'axios';
import { Token } from '../types';
import { buildTokenString } from './tokenator';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36';

async function sendCheckInRequest(token: Token | string) {

	token = buildTokenString(token);

	return axios({
		method: 'post',
		url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign',
		data: { 'act_id': 'e202303301540311' },
		headers: { 'Cookie': token, 'User-Agent': USER_AGENT },
	}).then((response) => {
		if (typeof token !== 'string') {
			console.log('CHECK IN: ' + token.discord_id);
		} else {
			console.log('CHECK IN: ' + token);
		}
		return response.data;
	});

}

export { sendCheckInRequest };
