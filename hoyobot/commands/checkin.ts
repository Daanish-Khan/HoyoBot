import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';
import { sendCheckInRequest } from '../helpers/checkinuser.ts';
import { errorEmbed, infoEmbed, successEmbed } from '../helpers/embeds.ts';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('checkin')
		.addStringOption(option =>
			option.setName('game')
				.setDescription('Which game you want to check-in for.')
				.setRequired(true)
				.addChoices(
					{ name: 'Honkai Star Rail', value: 'hsr' },
					{ name: 'Genshin Impact', value: 'genshin' },
				),
		)
		.setDescription('Immediately checks you in. Does not work if you have not persisted your token in db.')
		.setDMPermission(false),
	execute: async (interaction) => {
		const userId = interaction.member.user.id;

		const token = await supabase
			.from('tokens')
			.select()
			.eq('discord_id', userId)
			.maybeSingle();

		const game = interaction.options.getString('game');
		const referredName = game === 'hsr' ? 'Trailblazer' : 'Traveller';

		if (token.data === null) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('You are not registered! Please use `/register.`'),
				],
			});
			return;
		}

		const response = await sendCheckInRequest(token.data, game);

		if (response.retcode === -5003) {
			interaction.editReply({
				embeds: [
					infoEmbed()
						.setDescription(`You've already checked in today, ${referredName}~`),
				],
			});
			return;
		}

		if (response.retcode === -100) {
			console.log(`${token.data.discord_id} NEEDS TO RE-AUTHENTICATE!`);
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('Something went wrong during check-in. Please re-register using `/register` in a server!'),
				],
			}).catch((error) => {
				console.log(`CANNOT SEND ERROR MESSAGE TO ${token.data.discord_id} - ${error.toString()}`);
			});
			return;
		}

		if (response.retcode === -10002) {
			console.log(`${token.data.discord_id} DOES NOT HAVE AN ACCOUNT FOR ${game}`);
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setTitle('Account not Found!')
						.setDescription(`You do not have an account for ${game === 'hsr' ? 'Honkai Star Rail' : 'Genshin Impact' }!`
							+ ' Please create a character in game first, or try using another account.',
						),
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