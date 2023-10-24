import { Client } from 'discord.js';
import { supabase } from './supabase.ts';
import { sendCheckInRequest } from './checkinuser.ts';
import { ApprovedChannel, Token } from '../types';
import { successEmbed } from './embeds.ts';
import { users } from './persistedusers.ts';

async function checkInAllUsers(client: Client) {
	const approvedChannels = await supabase
		.from('approved_channels')
		.select();

	const tokens = await supabase
		.from('tokens')
		.select();

	tokens.data.forEach(async (token: Token) => {
		await sendCheckInRequest(token);
	});

	users.forEach(async (token: string) => {
		await sendCheckInRequest(token);
	});

	approvedChannels.data.forEach((channel: ApprovedChannel) => {
		const discordChannel = client.channels.cache.get(channel.channel_id);

		if (discordChannel.isTextBased()) {
			discordChannel.send({
				embeds: [
					successEmbed()
						.setTitle('Check In Complete!')
						.setDescription('Checked in for everyone! Please check your inbox for your rewards~'),
				],
			});
		}
	});

}

export { checkInAllUsers };