import { EmbedBuilder } from 'discord.js';

function defualtEmbed() {
	return new EmbedBuilder()
		.setAuthor({ name: 'HoyoBot', iconURL: 'https://i.imgur.com/XHSIt0N.jpeg' })
		.setTimestamp()
		.setFooter({ text: 'Support HoyoBot by buying me a coffee! https://www.buymeacoffee.com/dish <3' });
}

function errorEmbed() {
	return defualtEmbed()
		.setTitle('Pom-Pom got lost...')
		.setColor(0xFF0000);
}

function successEmbed() {
	return defualtEmbed()
		.setTitle('Success!')
		.setColor(0x028A0F);
}

function infoEmbed() {
	return defualtEmbed()
		.setColor(0xAF69EF);
}

export { defualtEmbed, errorEmbed, successEmbed, infoEmbed };