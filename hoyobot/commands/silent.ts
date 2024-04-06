import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';
import { errorEmbed, successEmbed } from '../helpers/embeds.ts';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('silent')
		.setDescription('Toggles those pesky check-in & code redeem messages! MUST BE ADMIN')
		.setDefaultMemberPermissions(0)
		.setDMPermission(false),
	execute: async (interaction) => {
		const isSilent = (await supabase
			.from('approved_channels')
			.select('silent')
			.eq('channel_id', interaction.channelId)
			.maybeSingle()).data;

		if (isSilent === null) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('This channel is not an approved channel! Use `/setchannel` to approve it.'),
				],
			});
			return;
		}

		const response = await supabase
			.from('approved_channels')
			.update({ silent: !isSilent.silent })
			.eq('channel_id', interaction.channelId)
			.select();

		const data: any = response.data[0];

		const toggle = data.silent ? 'off' : 'on';

		console.log(`TURNING ${toggle} MESSAGES FOR CHANNEL ${interaction.channelId}`);
		interaction.editReply({
			embeds: [
				successEmbed()
					.setDescription(`Check-In messages have been turned ${toggle}! Use \`/silent\` to toggle it if needed.`),
			],
		});
	},
};

export default command;