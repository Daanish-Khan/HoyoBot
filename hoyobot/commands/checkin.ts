import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';
import { sendCheckInRequest } from '../helpers/checkinuser.ts';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('checkin')
		.setDescription('Immediately checks you in.'),
	execute: async (interaction) => {
		const userId = interaction.member.user.id;

		// Discord only gives 3 seconds to respond, so this prevents it from throwing an error if it takes longer
		await interaction.deferReply({ ephemeral: true });

		const token = await supabase
			.from('tokens')
			.select()
			.eq('discord_id', userId)
			.maybeSingle();
		if (Object.hasOwn(token, 'data')) {
			await sendCheckInRequest(token.data);
			interaction.editReply({ content: 'Successfully checked in!' });
		} else {
			interaction.editReply({ content: 'You are not registered! Please use /register.' });
		}
	},
};

export default command;