import axios from 'axios';
import { ApprovedChannel, Token } from '../types';
import { buildTokenString } from './tokenator';
import { users } from './persistedusers.ts';
import { supabase } from './supabase.ts';
import { Client } from 'discord.js';
import { successEmbed, errorEmbed } from './embeds.ts';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36';

async function redeemCode(token: Token | string, code: string, client: Client) {
	const stringToken = buildTokenString(token);

	let url = 'https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesOfRegionByCookieToken';

	console.log(`SENDING REQUEST TO ${url}`);
	return await axios({
		method: 'get',
		url: url,
		headers: { 'Cookie': stringToken, 'User-Agent': USER_AGENT },
		params: {
			'game_biz': 'hkrpg_global',
			'region': 'prod_official_usa',
		},
	}).then(async (resp) => {
		const response = resp.data;
		console.log(`RESPONSE - ${JSON.stringify(response)}`);

		if (isToken(token)) {
			if (response.retcode === -100) {
				console.log(`${token.discord_id} NEEDS TO RE-AUTHENTICATE!`);
				client.users.send(token.discord_id, {
					embeds: [
						errorEmbed()
							.setDescription('Something went wrong during code redemption. Please re-register using `/register`.'),
					],
				}).catch((error) => {
					console.log(`CANNOT SEND ERROR MESSAGE TO ${token.discord_id} - ${error.toString()}`);
				});
			}
		}

		if (response.message !== 'OK') {
			return null;
		}

		const user = response.data.list[0];
		url = 'https://sg-hkrpg-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey';

		console.log(`SENDING REQUEST TO ${url}`);
		return await axios({
			method: 'get',
			url: url,
			headers: { 'Cookie': stringToken, 'User-Agent': USER_AGENT },
			params: {
				'game_biz': user.game_biz,
				'region': user.region,
				'uid': user.game_uid,
				'cdkey': code,
				'lang': 'en',
			},
		}).then((redeemResponse) => {
			console.log(`RESPONSE - ${JSON.stringify(redeemResponse.data)}`);
			return redeemResponse.data;
		});

	});

}

async function redeemCodeForAllUsers(code: string, client: Client) {
	const approvedChannels = await supabase
		.from('approved_channels')
		.select()
		.eq('silent', false);

	const tokens = await supabase
		.from('tokens')
		.select();

	tokens.data.forEach((token: Token, index) => {
		setTimeout(() => {
			console.log(`REDEEMING FOR ${token.discord_id}`);
			redeemCode(token, code, client);
		}, index * 5000);
	});

	users.forEach((token: string, index) => {
		setTimeout(() => {
			console.log(`REDEEMING FOR ${token}`);
			redeemCode(token, code, client);
		}, index * 5000);
	});

	approvedChannels.data.forEach((channel: ApprovedChannel) => {
		const discordChannel = client.channels.cache.get(channel.channel_id);
		if (discordChannel === undefined || !discordChannel.isTextBased()) return;

		console.log(`SENDING CONFIRMATION MESSAGE TO ${discordChannel.id}`);

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

	console.log(`REDEEMING CODES FOR ${token.discord_id}`);

	let promise = Promise.resolve();
	codes.data.forEach((code) => {
		// Creating new promise to resolve every i + {delay} seconds
		promise = promise.then(() => {
			code = code.code;

			console.log(`REDEEMING CODE ${code}`);
			redeemCode(token, String(code), client).then(async (response) => {
				if (response !== null) {
					if (response.retcode === -2001) {
						console.log(`${code} EXPIRED - UPDATING IN DB`);
						await supabase
							.from('codes')
							.update({ expired: true })
							.eq('code', code);
					}
				}
			});
			return new Promise((resolve) => {
				setTimeout(resolve, 7000);
			});
		});
	});

	promise.then(() => {
		client.users.send(token.discord_id, {
			embeds: [
				successEmbed()
					.setDescription('Your code redemption has finished! Please check your inbox for your rewards~'),
			],
		}).catch((error) => {
			console.log(`CANNOT SEND ERROR MESSAGE TO ${token.discord_id} - ${error.toString()}`);
		});
	});

}

function isToken(token: Token | string): token is Token {
	return (token as Token).discord_id !== undefined;
}

export { redeemCode, redeemCodeForAllUsers, redeemAllCodes };