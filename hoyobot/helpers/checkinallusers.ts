import { Client } from 'discord.js';
import { supabase } from './supabase.ts';
import { sendCheckInRequest } from './checkinuser.ts';
import { ApprovedChannel, Token } from '../types';
import { errorEmbed, successEmbed } from './embeds.ts';
import { users } from './persistedusers.ts';

async function checkInAllUsers(client: Client) {
	const approvedChannels = await supabase
		.from('approved_channels')
		.select();

	const tokens = await supabase
		.from('tokens')
		.select();

	tokens.data.forEach(async (token: Token) => {
		try {
			await sendCheckInRequest(token);
		} catch (error) {
			client.users.send(token.discord_id, {
				embeds: [
					errorEmbed()
						.setTitle('Check In Failed!')
						.setDescription('Hey! Your check-in failed for some reason. Please DM **_dish_** for help with a screenshot of this message.')
						.addFields(
							{ name: 'discordId', value: token.discord_id },
							{ name: 'error', value: error },
						),
				],
			});
		}
	});

	users.forEach(async (token: string) => {
		sendCheckInRequest(token);
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