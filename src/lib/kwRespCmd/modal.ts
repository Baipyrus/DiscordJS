import { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from 'discord.js';

export function buildResponseModal(keyword: string): ModalBuilder {
	const modal = new ModalBuilder().setCustomId('response-add').setTitle('Add Response');

	const keywordInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
		new TextInputBuilder()
			.setLabel('Keyword')
			.setStyle(TextInputStyle.Short)
			.setCustomId('keyword')
			.setRequired(true)
			.setValue(keyword)
	);

	const nameInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
		new TextInputBuilder()
			.setLabel('Response Name')
			.setStyle(TextInputStyle.Short)
			.setCustomId('name')
			.setRequired(true)
	);

	const messageInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
		new TextInputBuilder()
			.setLabel('Response Message')
			.setStyle(TextInputStyle.Paragraph)
			.setCustomId('message')
			.setRequired(true)
	);

	modal.addComponents(keywordInput, nameInput, messageInput);
	return modal;
}
