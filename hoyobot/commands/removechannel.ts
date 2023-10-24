import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';
import { successEmbed } from '../helpers/embeds.ts';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('removechannel')
		.setDescription('Removes HoyoBot\'s permission to speak in this channel. MUST BE ADMIN')
		.setDefaultMemberPermissions(0),
	execute: async (interaction) => {
		await supabase
			.from('approved_channels')
			.delete()
			.eq('channel_id', interaction.channelId);
		interaction.editReply({
			embeds: [
				successEmbed()
					.setDescription('Channel has been removed!'),
			],
		});
	},
};

export default command;