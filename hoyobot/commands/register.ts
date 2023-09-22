import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';
import JSEncrypt from 'jsencrypt';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Adds you to the database.')
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
	execute: async (interaction) => {
		// No need for sanitization since supabase does it for us :)
		const email = interaction.options.getString('email');
		const password = interaction.options.getString('password');

		if (!validateEmail(email)) {
			interaction.editReply({ content: 'Your email is invalid! Please try again.' });
			return;
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
				interaction.editReply({ content: 'Something went wrong. Please contact `@_dish_` for support. Error Code: UPSERT_DELETE' });
				return;
			}
		}

		// Insert user
		const { error } = await supabase
			.from('users')
			.insert({ discord_id: interaction.member.user.id, server_id: interaction.guildId, username: encrypt(email), password: encrypt(password) });

		if (error != null) {
			console.log('UPSERT_INSERT_ERROR: ' + error);
			interaction.editReply({ content: 'Something went wrong. Please contact `@_dish_` for support. Error Code: UPSERT_INSERT' });
			return;
		}

		interaction.editReply({ content: 'Registered! Please authenicate yourself at ' + process.env.WEBSITE_URL });
	},
};

const validateEmail = (email: string) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		);
};

function encrypt(text: string) {
	const encryptor = new JSEncrypt();
	encryptor.setPublicKey(process.env.HYV_PUBLIC_KEY);

	return encryptor.encrypt(text);
}

export default command;