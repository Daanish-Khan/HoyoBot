import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { SlashCommand } from './types';
import { fileURLToPath } from 'url';
import { secrets } from './secrets';

const commands = [];

// Load all commands
const commandsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
	const filePath = './commands/' + file;
	const command = await import(filePath);
	if ('command' in command.default) {
		commands.push((command.default as SlashCommand).command.toJSON());
	}
}

const rest = new REST().setToken(secrets.BOT_SECRET);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		await rest.put(
			Routes.applicationCommands(secrets.CLIENT_ID),
			{ body: commands },
		);

		console.log(`Sucessfully reloaded ${commands.length} application (/) commands.`);

	} catch (error) {
		console.error(error);
	}
}) ();

