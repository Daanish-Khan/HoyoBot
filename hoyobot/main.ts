import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { SlashCommand } from './types';
import { fileURLToPath } from 'url';
import * as cron from 'node-cron';
import { checkInAllUsers } from './helpers/checkinallusers.ts';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Command Loading
client.slashCommands = new Collection();

const commandsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
	const filePath = './commands/' + file;
	const command = await import(filePath);
	if ('command' in command.default) {
		client.slashCommands.set((command.default as SlashCommand).command.name, (command.default as SlashCommand));
	}
}

// Command router
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.slashCommands.get(interaction.commandName);
	console.log('RECEIVED COMMAND: ' + interaction.commandName + ' TIMESTAMP: ' + new Date().toISOString());

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	// Discord only gives 3 seconds to respond, so this prevents it from throwing an error if it takes longer
	await interaction.deferReply({ ephemeral: true });

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error('COMMAND EXECUTION FAILED: ' + error + ' TIMESTAMP: ' + new Date().toISOString());
		await interaction.editReply({ content: 'There was an error while executing this command!' });
	}
});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

	// 5 14 * * * - 2:05PM EST cronjob since resets are based on CST (UTC+8) and I hate daylight savings
	cron.schedule('5 14 * * *', () => {
		checkInAllUsers(client);
	});
});

client.login(process.env.BOT_SECRET);