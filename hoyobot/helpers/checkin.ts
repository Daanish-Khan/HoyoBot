import { Client } from 'discord.js';
import { supabase } from './supabase.ts';
import axios from 'axios';
import { ApprovedChannel, Token } from '../types';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36';

async function checkIn(client: Client) {
	const approvedChannels = await supabase
		.from('approved_channels')
		.select();

	const tokens = await supabase
		.from('tokens')
		.select();

	tokens.data.forEach(async (token: Token) => {
		await sendCheckInRequest(token);
	});

	approvedChannels.data.forEach((channel: ApprovedChannel) => {
		const discordChannel = client.channels.cache.get(channel.channel_id);

		if (discordChannel.isTextBased()) {
			discordChannel.send('Checked in for everyone! If any errors have occured, the bot will DM you. Please follow up with @_dish_ for troubleshooting.');
		}
	});

}

async function sendCheckInRequest(token: Token) {
	axios({
		method: 'post',
		url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign',
		data: { 'act_id': 'e202303301540311' },
		headers: { 'Cookie': tokenToString(token), 'User-Agent': USER_AGENT },
	}).then((response) => {
		console.log('CHECK IN: ' + token.discord_id);
		console.log(response.data);
		return response.data;
	}).catch(function(error) {
		console.log(error);
	});

}

function tokenToString(token: Token) {
	return `account_id_v2=${token.account_id_v2};account_mid_v2=${token.account_mid_v2};cookie_token_v2=${token.cookie_token_v2};ltoken_v2=${token.ltoken_v2};ltuid_v2=${token.ltuid_v2}`;
}

export { checkIn };