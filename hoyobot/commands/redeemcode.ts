import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';
import { errorEmbed, infoEmbed, successEmbed } from '../helpers/embeds.ts';
import { redeemAllCodes, redeemCode, redeemCodeForAllUsers } from '../helpers/redeem.ts';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('redeem')
		.setDescription('Redeems code for everyone.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('code')
				.setDescription('Redeems code for yourself and all others.')
				.addStringOption(option =>
					option.setName('code')
						.setDescription('The code to redeem')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('all')
				.setDescription('Redeems every previous code for you!.'),
		),
	execute: async (interaction) => {
		const userId = interaction.member.user.id;
		const token = await supabase
			.from('tokens')
			.select()
			.eq('discord_id', userId)
			.maybeSingle();

		if (!Object.hasOwn(token, 'data')) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('You are not registered! Please use `/register.`'),
				],
			});
			return;
		}

		if (interaction.options.getSubcommand() === 'all') {
			redeemAllCodes(token.data, interaction.client);
			interaction.editReply({
				embeds: [
					infoEmbed()
						.setTitle('Pom-Pom is processing your request...')
						.setDescription('Code redemption may take a while. Please wait for a DM for confirmation of rewards!'),
				],
			});
			return;
		}

		const code = interaction.options.getString('code');

		const redemptionCode = await supabase
			.from('codes')
			.select('*', { count: 'exact', head: true })
			.eq('code', code);


		if (redemptionCode.count > 0) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('The code you have entered has already been redeemed!'),
				],
			});
			return;
		}

		const response = await redeemCode(token.data, code);

		// Something went wrong during redemption
		if (response == null) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('Something went horribly wrong! Please contact _dish_ for help.'),
				],
			});
			return;
		}

		const retcode = response.retcode;

		// Expired code
		if (retcode == -2001) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('The code you have entered has expired.'),
				],
			});
			return;
		}

		// Too fast redemption
		if (retcode == -2016) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('You have attempted to redeem too frequently. Please wait a bit and then try again~'),
				],
			});
		}

		// General error handling
		if (retcode != 0 && retcode != -2017) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('Something went horribly wrong. Please contact _dish_ with a screenshot of this message.')
						.addFields(
							{ name: 'message', value: response },
						),
				],
			});
		}

		const dbResponse = await supabase
			.from('codes')
			.insert({
				code: code,
				expired: false,
			});

		if (dbResponse.error != null) {
			interaction.editReply({
				embeds: [
					infoEmbed()
						.setTitle('Something happened...')
						.setDescription('Your code was redeemed successfully. However, it did not redeem for everyone else! Please contact _dish_ with a screenshot of this message.')
						.addFields(
							{ name: 'error', value: dbResponse.error.message },
						),
				],
			});
			return;
		}

		let redeemedDesc = 'Successfully redeemed code! Please check your inbox for your rewards~';

		if (retcode == -2017) {
			redeemedDesc = 'You\'ve already redeemed this code before! However, other users will have the rewards redeemed for them. Thank you for your contribution~';
		}

		// Success
		interaction.editReply({
			embeds: [
				successEmbed()
					.setDescription(redeemedDesc),
			],
		});

		redeemCodeForAllUsers(code, interaction.client);

	},
};

export default command;