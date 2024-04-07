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
				)
				.addStringOption(option =>
					option.setName('game')
						.setDescription('The game you want to redeem for.')
						.setRequired(true)
						.addChoices(
							{ name: 'Honkai Star Rail', value: 'hsr' },
							{ name: 'Genshin Impact', value: 'genshin' },
						),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('all')
				.setDescription('Redeems all previous codes for you!'),
		)
		.setDMPermission(false),
	execute: async (interaction) => {
		const userId = interaction.member.user.id;
		const game = interaction.options.getString('game');
		const token = await supabase
			.from('tokens')
			.select()
			.eq('discord_id', userId)
			.maybeSingle();

		if (token.data === null) {
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
						.setDescription('Code redemption may take a while. Please wait for a DM for confirmation of rewards! If it takes more than 30 minutes try again or join the support discord for help.'),
				],
			});
			return;
		}

		const code = interaction.options.getString('code');
		console.log(`ATTEMPTING TO REDEEM CODE ${code}`);

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
			console.log(`${code} ALREADY REDEEMED`);
			return;
		}

		const response = await redeemCode(token.data, code, interaction.client, game);
		// Something went wrong during redemption
		if (response === null) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('Something went horribly wrong! Please join the support discord for help.'),
				],
			});
			console.log(`${code} caused it to shit the bed`);
			return;
		}

		const retcode = response.retcode;

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

		// Invalid code
		if (retcode == -2003) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('The code you have entered is invalid!'),
				],
			});
			console.log(`${code} IS INVALID`);
			return;
		}

		// Expired code
		if (retcode == -2001) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('The code you have entered has expired.'),
				],
			});
			console.log(`${code} IS EXPIRED`);
			return;
		}

		// Too fast redemption
		if (retcode === -2016) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('You have attempted to redeem too frequently. Please wait a bit and then try again~'),
				],
			});
			console.log('TOO MANY REQUESTS');
			return;
		}

		// Not high enough level
		if (retcode === -2011) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setTitle('Too low level!')
						.setDescription('You are too low level to redeem codes! Please keep playing the game~'),
				],
			});
			return;
		}

		// General error handling
		if (retcode != 0 && retcode != -2017) {
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('Something went horribly wrong. Please join the support discord for help.')
						.setFields({ name: 'Response', value: response.data }),
				],
			});
			console.log(`UNKNOWN ERROR - ${response.data}`);
			return;
		}

		// Inserting to DB
		const dbResponse = await supabase
			.from('codes')
			.insert({
				code: code,
				expired: false,
				game: game,
			});

		if (dbResponse.error != null) {
			interaction.editReply({
				embeds: [
					infoEmbed()
						.setTitle('Something happened...')
						.setDescription('Your code was redeemed successfully. However, it did not redeem for everyone else! Please join the support discord for help.')
						.addFields(
							{ name: 'error', value: dbResponse.error.message },
						),
				],
			});
			console.log(`ERROR SAVING ${code} to DB - ${dbResponse.error.message}`);
			return;
		}

		console.log(`SAVED ${code} TO DB`);

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
		console.log('SINGLE REDEEM SUCCESSFUL');
		redeemCodeForAllUsers(code, interaction.client, game);

	},
};

export default command;