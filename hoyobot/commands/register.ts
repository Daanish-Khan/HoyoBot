import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand, Token } from '../types';
import { supabase } from '../helpers/supabase.ts';
import JSEncrypt from 'jsencrypt';
import { errorEmbed, infoEmbed, successEmbed } from '../helpers/embeds.ts';
import { sendCheckInRequest } from '../helpers/checkinuser.ts';
import { users } from '../helpers/persistedusers.ts';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Starts the registration process.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Registers with an email/password')
				.addStringOption(option =>
					option.setName('email')
						.setDescription('HSR Email')
						.setRequired(true),
				)
				.addStringOption(option =>
					option.setName('password')
						.setDescription('HSR Account Password (will be encrypted then deleted after registration)')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('token')
				.setDescription('Registers with a token grabbed from MHY website. Do /register help for more info.')
				.addStringOption(option =>
					option.setName('tokenstring')
						.setDescription('Token string from MHY\'s website.')
						.setRequired(true),
				)
				.addBooleanOption(option =>
					option.setName('persist')
						.setDescription('True = saved to db. False = saved until bot restart.')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('help')
				.setDescription('Describes the command.'),
		),
	execute: async (interaction) => {
		let email = null;
		let password = null;

		if (interaction.options.getSubcommand() === 'help') {
			return;
		}

		if (interaction.options.getSubcommand() === 'user') {
			// No need for sanitization since supabase does it for us :)
			email = interaction.options.getString('email');
			password = interaction.options.getString('password');

			if (!validateEmail(email)) {
				interaction.editReply({
					embeds: [
						errorEmbed()
							.setDescription('Your email is invalid! Please try again.'),
					],
				});
				return;
			}
		}

		// Upserting/Updating here messes with supabase encryption.
		const { count } = await supabase
			.from('users')
			.select('*', { count: 'exact', head: true })
			.eq('discord_id', interaction.member.user.id);

		// Check to see if user exists already
		if (count > 0) {
			const { error } = await supabase
				.from('users')
				.delete()
				.eq('discord_id', interaction.member.user.id);

			if (error != null) {
				console.log('USERT_DELETE_ERROR: ' + error);
				interaction.editReply({
					embeds: [
						errorEmbed()
							.setDescription('Something went wrong. Please contact `@_dish_` for support.')
							.addFields({ name: 'Error Code', value: 'UPSERT_DELETE' }),
					],
				});
				return;
			}
		}

		// Insert user
		const { error } = await supabase
			.from('users')
			.insert({ discord_id: interaction.member.user.id, server_id: interaction.guildId, username: encrypt(email), password: encrypt(password) });

		if (error != null) {
			console.log('UPSERT_INSERT_ERROR: ' + error);
			interaction.editReply({
				embeds: [
					errorEmbed()
						.setDescription('Something went wrong. Please contact `@_dish_` for support.')
						.addFields({ name: 'Error Code', value: 'UPSERT_INSERT' }),
				],
			});
			return;
		}

		// Registration with token
		if (interaction.options.getSubcommand() === 'token') {

			if (interaction.options.getBoolean('persist')) {
				const tokenRegisterResponse = await supabase
					.from('tokens')
					.insert({ discord_id: interaction.member.user.id, cookie_v1: interaction.options.getString('tokenstring') });
				if (tokenRegisterResponse.error != null) {
					console.log('DIRECT_TOKEN_ERROR: ' + error);
					interaction.editReply({
						embeds: [
							errorEmbed()
								.setDescription('Something went wrong. Please contact `@_dish_` for support.')
								.addFields({ name: 'Error Code', value: 'DIRECT_TOKEN' }),
						],
					});
					return;
				}
			} else {
				users.push(interaction.options.getString('tokenstring'));
			}

			const response = await sendCheckInRequest(interaction.options.getString('tokenstring'));
			console.log(response);
		}

		interaction.editReply({
			embeds: [
				successEmbed()
					.setDescription('Registered! Please authenicate yourself at ' + process.env.WEBSITE_URL),
			],
		});

	},
};

const validateEmail = (email: string) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		);
};

function encrypt(text: string | null) {
	if (text === null) return null;

	const encryptor = new JSEncrypt();
	encryptor.setPublicKey(process.env.HYV_PUBLIC_KEY);

	return encryptor.encrypt(text);
}

export default command;