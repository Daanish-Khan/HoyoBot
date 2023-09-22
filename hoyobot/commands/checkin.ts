import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';
import { sendCheckInRequest } from '../helpers/checkinuser.ts';
import { errorEmbed, infoEmbed, successEmbed } from '../helpers/embeds.ts';

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
			const response = await sendCheckInRequest(token.data);
			console.log(response);

			if (response.retcode == -5003) {
				interaction.editReply({
					embeds: [
						infoEmbed()
							.setDescription('You\'ve already checked in today, Trailblazer~'),
					],
				});
			} else {
				interaction.editReply({
					embeds: [
						successEmbed()
							.setDescription('Successfully checked in!'),
					],
				});
			}

		} else {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('You are not registered! Please use `/register.`'),
				],
			});
		}
	},
};

export default command;