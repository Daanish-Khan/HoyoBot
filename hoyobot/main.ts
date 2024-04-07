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
import axios from 'axios';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const VERSION = 'v2.0.0';

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

client.once(Events.ClientReady, async c => {
	console.log('STARTING BOT...');

	// 5 14 * * * - 2:05PM EST cronjob since resets are based on CST (UTC+8) and I hate daylight savings
	console.log('ENABLING CRON');
	cron.schedule('5 14 * * *', () => {
		checkInAllUsers(client);
	});

	if (secrets.ENV !== 'production') {
		console.log('NOT IN PRODUCTION - SKIPPING UPDATE NOTES');
		console.log(`Ready! Logged in as ${c.user.tag}`);
		return;
	}

	console.log('REQUESTING API VERSION');
	console.log(`MAKING REQUEST TO ${secrets.API_URL}/version`);
	const apiVersion = await axios({
		method: 'get',
		url: `${secrets.API_URL}/version`,
	}).then(response => response.data);
	console.log(`FOUND VERSION ${VERSION}`);

	if (apiVersion === VERSION) {
		console.log(`Ready! Logged in as ${c.user.tag}`);
		return;
	}

	console.log('NEW UPDATE DETECTED');

	console.log('UPDATING API VERSION');
	console.log(`MAKING POST REQUEST TO ${secrets.API_URL}/version WITH NEW VERSION ${VERSION}`);
	axios({
		method: 'post',
		url: `${secrets.API_URL}/version`,
		data: {
			'version': VERSION,
		},
	});

	console.log(`GETTING UPDATE NOTES FOR VERSION ${VERSION}`);
	console.log(`MAKING REQUEST TO ${secrets.API_URL}/update-notes WITH VERSION ${VERSION}`);
	const updateNotes = (await axios({
		method: 'get',
		url: `${secrets.API_URL}/update-notes`,
		params: {
			'version': VERSION,
		},
	}).then(response => response.data)).updateNotes;
	console.log(`UPDATE NOTES FOUND - ${updateNotes}`);

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

	console.log(`Ready! Logged in as ${c.user.tag}`);

});

client.login(secrets.BOT_SECRET);