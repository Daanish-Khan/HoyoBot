import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';
import { sendCheckInRequest } from '../helpers/checkinuser.ts';
import { errorEmbed, infoEmbed, successEmbed } from '../helpers/embeds.ts';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('checkin')
		.setDescription('Immediately checks you in. Does not work if you have not persisted your token in db.')
		.setDMPermission(false),
	execute: async (interaction) => {
		const userId = interaction.member.user.id;

		const token = await supabase
			.from('tokens')
			.select()
			.eq('discord_id', userId)
			.maybeSingle();

		const games = ['hsr', 'genshin'];
		const responses = { 'hsr': null, 'genshin': null };

		for (const game of games) {
			if (token.data === null) {
				interaction.editReply({
					embeds: [
						errorEmbed()
							.setDescription('You are not registered! Please use `/register.`'),
					],
				});
				return;
			}

			responses[game] = await sendCheckInRequest(token.data, game);

		}

		if (responses['hsr'].retcode === -5003 && responses['genshin'].retcode === -5003) {
			interaction.editReply({
				embeds: [
					infoEmbed()
						.setDescription(`You've already checked in today, ${interaction.user.displayName}~`),
				],
			});
			return;
		}

		if (responses['hsr'].retcode === -100 || responses['genshin'] === -100) {
			console.log(`${token.data.discord_id} NEEDS TO RE-AUTHENTICATE!`);
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('Something went wrong during check-in. Please re-register using `/register`!'),
				],
			});
			return;
		}

		interaction.editReply({
			embeds: [
				successEmbed()
					.setDescription('Successfully checked in!'),
			],
		});

	},
};

export default command;