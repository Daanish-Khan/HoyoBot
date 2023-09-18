import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	execute: (interaction) => {
		interaction.reply({ content: 'Pong!', ephemeral: true });
	},
};

export default command;