import { Client } from 'discord.js';
import { supabase } from './supabase.ts';
import { sendCheckInRequest } from './checkinuser.ts';
import { ApprovedChannel, Token } from '../types';
import { errorEmbed, successEmbed } from './embeds.ts';
import { users } from './persistedusers.ts';

async function checkInAllUsers(client: Client) {
	const approvedChannels = await supabase
		.from('approved_channels')
		.select()
		.eq('silent', false);

	const tokens = await supabase
		.from('tokens')
		.select();

	tokens.data.forEach(async (token: Token) => {
		let responseHSR = null;
		let responseGenshin = null;
		try {
			responseHSR = await sendCheckInRequest(token, 'hsr');
			responseGenshin = await sendCheckInRequest(token, 'genshin');
		} catch (error) {
			console.log(`ERROR OCCURRED WHEN TRYING TO CHECK-IN ${token.discord_id} - ${error.stack()}`);

			client.users.send(token.discord_id, {
				embeds: [
					errorEmbed()
						.setTitle('Check In Failed!')
						.setDescription('Hey! Your check-in failed for some reason. Please join the support discord for help.')
						.addFields(
							{ name: 'discordId', value: token.discord_id },
							{ name: 'error', value: error.toString() },
						),
				],
			}).catch((err) => {
				console.log(`CANNOT SEND ERROR MESSAGE TO ${token.discord_id} - ${err.toString()}`);
			});
 
		}

		if (responseHSR === null || responseGenshin === null) return;

		if (responseHSR.retcode === -100 || responseGenshin === -100) {
			console.log(`${token.discord_id} NEEDS TO RE-AUTHENTICATE!`);
			client.users.send(token.discord_id, {
				embeds: [
					errorEmbed()
						.setDescription('Something went wrong during check-in. Please re-register using `/register` in a server! (NOT IN DMS IT WILL NOT WORK).'),
				],
			}).catch((error) => {
				console.log(`CANNOT SEND ERROR MESSAGE TO ${token.discord_id} - ${error.toString()}`);
			});
		}

	});

	users.forEach(async (token: string) => {
		sendCheckInRequest(token, 'hsr');
		sendCheckInRequest(token, 'genshin');
	});

	approvedChannels.data.forEach((channel: ApprovedChannel) => {
		const discordChannel = client.channels.cache.get(channel.channel_id);
		if (discordChannel === undefined || !discordChannel.isTextBased()) return;

		discordChannel.send({
			embeds: [
				successEmbed()
					.setTitle('Check In Complete!')
					.setDescription('Checked in for everyone! Please check your inbox for your rewards~'),
			],
		});

	});

}

export { checkInAllUsers };