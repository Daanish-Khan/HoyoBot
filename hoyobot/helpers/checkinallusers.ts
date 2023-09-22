import { Client } from 'discord.js';
import { supabase } from './supabase.ts';
import { sendCheckInRequest } from './checkinuser.ts';
import { ApprovedChannel, Token } from '../types';
import { successEmbed } from './embeds.ts';

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

	approvedChannels.data.forEach((channel: ApprovedChannel) => {
		const discordChannel = client.channels.cache.get(channel.channel_id);

		if (discordChannel.isTextBased()) {
			discordChannel.send({
				embeds: [
					successEmbed()
						.setTitle('Check In Complete!')
						.setDescription('Checked in for everyone! If any errors have occured, the bot will DM you. Please follow up with `@_dish_` for troubleshooting.'),
				],
			});
		}
	});

}

export { checkInAllUsers };