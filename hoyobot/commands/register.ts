import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../helpers/supabase.ts';

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
				.setDescription('HSR Account Password (don\'t worry, this will be encrypted then deleted after registration is completed)')
				.setRequired(true),
		),
	execute: async (interaction) => {
		// No need for sanitization since supabase does it for us :)
		const email = interaction.options.getString('email');
		const password = interaction.options.getString('password');

		if (!validateEmail(email)) {
			interaction.reply({ content: 'Your email is invalid! Please try again.', ephemeral: true });
			return;
		}

		const { data, error } = await supabase
			.from('users')
			.select()
			.limit(1)
			.single();
		interaction.reply({ content: JSON.stringify(data), ephemeral: true });
	},
};

const validateEmail = (email) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		);
};

export default command;