import axios from 'axios';
import { ApprovedChannel, Token } from '../types';
import { buildTokenString } from './tokenator';
import { users } from './persistedusers.ts';
import { supabase } from './supabase.ts';
import { Client } from 'discord.js';
import { successEmbed } from './embeds.ts';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36';

async function redeemCode(token: Token | string, code: string) {
	token = buildTokenString(token);

	const response = (await axios({
		method: 'get',
		url: 'https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesOfRegionByCookieToken',
		headers: { 'Cookie': token, 'User-Agent': USER_AGENT },
		params: {
			'game_biz': 'hkrpg_global',
			'region': 'prod_official_usa',
		},
	})).data;

	if (response.message != 'OK') {
		return null;
	}

	const user = response.data.list[0];

	axios({
		method: 'get',
		url:'https://sg-hkrpg-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
		headers: { 'Cookie': token, 'User-Agent': USER_AGENT },
		params: {
			'game_biz': user.game_biz,
			'region': user.region,
			'uid': user.game_uid,
			'cdkey': code,
			'lang': 'en',
		},
	}).then((resp) => {
		return resp.data;
	});
}

async function redeemCodeForAllUsers(code: string, client: Client) {
	const approvedChannels = await supabase
		.from('approved_channels')
		.select();

	const tokens = await supabase
		.from('tokens')
		.select();

	tokens.data.forEach(async (token: Token) => {
		await redeemCode(token, code);
	});

	users.forEach(async (token: string) => {
		await redeemCode(token, code);
	});

	approvedChannels.data.forEach((channel: ApprovedChannel) => {
		const discordChannel = client.channels.cache.get(channel.channel_id);
		if (!discordChannel.isTextBased()) return;

		discordChannel.send({
			embeds: [
				successEmbed()
					.setTitle('Code Redemption')
					.setDescription(`Someone redeemed the code ${code}! Please check your inbox for your rewards~`),
			],
		});
	});
}

async function redeemAllCodes(token: Token, client: Client) {
	const codes = await supabase
		.from('codes')
		.select('code')
		.eq('expired', false);

	await codes.data.forEach(async (code) => {
		const response = await redeemCode(token, String(code));

		if (response != null) {
			if (response.retcode == -2001) {
				await supabase
					.from('codes')
					.update({ expired: true })
					.eq('code', code);
			}

			// Wait more if timeout
			if (response.retcode == -2016) {
				await new Promise(res => setTimeout(res, 20000));
			}
		}

		// Waiting to prevent request timeout
		await new Promise(res => setTimeout(res, 10000));
	});

	client.users.send(token.discord_id, {
		embeds: [
			successEmbed()
				.setDescription('Your code redemption has finished! Please check your inbox for your rewards~'),
		],
	});
}

export { redeemCode, redeemCodeForAllUsers, redeemAllCodes };