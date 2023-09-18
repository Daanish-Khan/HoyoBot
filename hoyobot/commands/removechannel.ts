import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';

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
		interaction.reply({ content: 'Channel has been removed!', ephemeral: true });
	},
};

export default command;