import axios from 'axios';
import { ApprovedChannel, Token } from '../types';
import { buildTokenString } from './tokenator';
import { users } from './persistedusers.ts';
import { supabase } from './supabase.ts';
import { Client } from 'discord.js';
import { successEmbed, errorEmbed, infoEmbed } from './embeds.ts';
import { HYV_URLS, getGameURLS } from './urls.ts';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36';

async function redeemCode(token: Token | string, code: string, client: Client, game: string) {
	const stringToken = buildTokenString(token);

	let url = HYV_URLS.GAME_REGION_URL;

	console.log(`SENDING REQUEST TO ${url} FOR GAME ${game}`);
	return await axios({
		method: 'get',
		url: url,
		headers: { 'Cookie': stringToken, 'User-Agent': USER_AGENT },
		params: {
			'game_biz': game === 'hsr' ? 'hkrpg_global' : 'hk4e_global',
			'region': game === 'hsr' ? 'prod_official_usa' : 'os_usa',
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
							.setDescription('Something went wrong during code redemption. Please re-register using `/register` in a server! (NOT IN DMS IT WILL NOT WORK).'),
					],
				}).catch((error) => {
					console.log(`CANNOT SEND ERROR MESSAGE TO ${token.discord_id} - ${error.toString()}`);
				});
				return;
			}
		}

		if (response.data.list.length === 0) {
			response.retcode = -10002;
			return response;
		}

		if (response.message !== 'OK') {
			return null;
		}

		const user = response.data.list[0];
		url = getGameURLS(game).CODE_REDEEM_URL;

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

async function redeemCodeForAllUsers(code: string, client: Client, game: string) {
	const approvedChannels = await supabase
		.from('approved_channels')
		.select()
		.eq('silent', false);

	const tokens = await supabase
		.from('tokens')
		.select();

	let tokenPromise = Promise.resolve();
	let userPromise = Promise.resolve();
	tokens.data.forEach((token: Token) => {
		tokenPromise = tokenPromise.then(() => {
			console.log(`REDEEMING FOR ${token.discord_id}`);
			redeemCode(token, code, client, game);

			return new Promise((resolve) => {
				setTimeout(resolve, 5000);
			});
		});
	});

	users.forEach((token: string) => {
		userPromise = userPromise.then(() => {
			console.log(`REDEEMING FOR ${token}`);
			redeemCode(token, code, client, game);

			return new Promise((resolve) => {
				setTimeout(resolve, 5000);
			});
		});
	});

	Promise.all([tokenPromise, userPromise]).then(() => {
		approvedChannels.data.forEach((channel: ApprovedChannel) => {
			const discordChannel = client.channels.cache.get(channel.channel_id);
			if (discordChannel === undefined || !discordChannel.isTextBased()) return;

			console.log(`SENDING CONFIRMATION MESSAGE TO ${discordChannel.id}`);

			discordChannel.send({
				embeds: [
					successEmbed()
						.setTitle('Code Redemption')
						.setDescription(`Someone redeemed the code **${code}** for **${game === 'hsr' ? 'Honkai Star Rail' : 'Genshin Impact'}**! Please check your inbox for your rewards~`),
				],
			});
		});

		console.log(`DONE REDEEMING ${code} FOR ALL USERS`);
	});

}

async function redeemAllCodes(token: Token, client: Client) {
	const codes = await supabase
		.from('codes')
		.select('code, game')
		.eq('expired', false);

	const redeemedCodes = { 'hsr': [], 'genshin': [] };

	console.log(`REDEEMING CODES FOR ${token.discord_id}`);

	let promise = Promise.resolve();
	codes.data.forEach((code) => {
		// Creating new promise to resolve every i + {delay} seconds
		promise = promise.then(() => {
			const game = code.game;
			code = code.code;

			console.log(`REDEEMING CODE ${code} FOR ${game}`);
			redeemCode(token, String(code), client, game).then(async (response) => {
				if (response !== null) {
					if (response.retcode === -2001) {
						console.log(`${code} EXPIRED - UPDATING IN DB`);
						await supabase
							.from('codes')
							.update({ expired: true })
							.eq('code', code);
					}

					if (response.retcode === 0) {
						redeemedCodes[game].push(code);
					}
				}
			});
			return new Promise((resolve) => {
				setTimeout(resolve, 7000);
			});
		});
	});

	promise.then(() => {
		const redeemedCodeFields = [];

		if (redeemedCodes['hsr'].length > 0) {
			redeemedCodeFields.push(
				{
					name: 'Honkai Star Rail Reedeemed Codes',
					value: redeemedCodes['hsr'].join(', '),
					inline: true,
				},
			);
		}

		if (redeemedCodes['genshin'].length > 0) {
			redeemedCodeFields.push(
				{
					name: 'Genshin Impact Reedeemed Codes',
					value: redeemedCodes['genshin'].join(', '),
					inline: true,
				},
			);
		}
		client.users.send(token.discord_id, {
			embeds: [
				redeemedCodeFields.length > 0 ?
					successEmbed()
						.setDescription('Your code redemption has finished! Please check your inbox for your rewards~')
						.addFields(redeemedCodeFields)
					: infoEmbed()
						.setTitle('No redeemable codes found!')
						.setDescription('Pom-Pom tried all the codes they could find, but it looks like you\'ve redeemed them all!'),
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