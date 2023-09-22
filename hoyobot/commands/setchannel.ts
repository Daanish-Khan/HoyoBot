import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('setchannel')
		.setDescription('Allows HoyoBot to speak in the same channel this command was sent in. MUST BE ADMIN')
		.setDefaultMemberPermissions(0),
	execute: async (interaction) => {
		await supabase
			.from('approved_channels')
			.insert({ channel_id: interaction.channelId, server_id: interaction.guildId });
		interaction.editReply({ content: 'Channel has been added!' });
	},
};

export default command;