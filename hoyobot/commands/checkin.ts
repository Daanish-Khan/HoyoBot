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

		const token = await supabase
			.from('tokens')
			.select()
			.eq('discord_id', userId)
			.maybeSingle();
		if (Object.hasOwn(token, 'data')) {
			await sendCheckInRequest(token.data);
			interaction.reply({ content: 'Successfully checked in!', ephemeral: true });
		} else {
			interaction.reply({ content: 'You are not registered! Please use /register.', ephemeral: true });
		}
	},
};

export default command;