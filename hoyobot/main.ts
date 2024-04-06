import { Client, Collection, Events, GatewayIntentBits, verifyString } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { ApprovedChannel, SlashCommand } from './types';
import { fileURLToPath } from 'url';
import * as cron from 'node-cron';
import { checkInAllUsers } from './helpers/checkinallusers.ts';
import { errorEmbed, infoEmbed } from './helpers/embeds.ts';
import { secrets } from './secrets.ts';
import { supabase } from './helpers/supabase.ts';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const VERSION = 'v1.3.0';
const VERSION_FILE_NAME = './version.json';

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
	if (!interaction.guild) {
		await interaction.reply({
			embeds: [
				errorEmbed()
					.setDescription('Commands are only useable in a server!');
			],
			ephemeral: true,
		});
		return;
	}

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
		console.log(error.stack);
		await interaction.editReply({
			embeds: [
				errorEmbed()
					.setDescription('There was an error while executing this command!')
					.addFields({ name: 'Error', value: error.toString() }),
			],
		});
	}
});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

	if (secrets.ENV !== 'production') {
		console.log('NOT IN PRODUCTION - SKIPPING UPDATE NOTES');
		return;
	}

	fs.readFile(VERSION_FILE_NAME, 'utf8', async function readFileCallback(err, data) {
		if (err) {
			console.log(err);
			return;
		}

		const json = JSON.parse(data);

		const prevVer = json.version;
		const updateNotes = json.updateNotes[VERSION];

		if (prevVer === VERSION) return;

		json.version = VERSION;

		fs.writeFile(VERSION_FILE_NAME, JSON.stringify(json, null, 2), (err) => {
			if (err) return console.log(err);
			console.log(`WRITING TO ${VERSION_FILE_NAME}`);
		});

		console.log('NEW UPDATE DETECTED');
		const approvedChannels = await supabase
			.from('approved_channels')
			.select();

		approvedChannels.data.forEach((channel: ApprovedChannel) => {
			const discordChannel = client.channels.cache.get(channel.channel_id);
			if (discordChannel === undefined || !discordChannel.isTextBased()) return;

			console.log(`SENDING UPDATE MESSAGE TO ${discordChannel.id}`);

			discordChannel.send({
				embeds: [
					infoEmbed()
						.setTitle(`Update Notes for new release ${VERSION}!`)
						.setDescription(updateNotes),
				],
			});
		});

	});

	// 5 14 * * * - 2:05PM EST cronjob since resets are based on CST (UTC+8) and I hate daylight savings
	cron.schedule('5 14 * * *', () => {
		checkInAllUsers(client);
	});
});

client.login(secrets.BOT_SECRET);