import { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder } from 'discord.js';

export function buildResponseModal(keyword: string): ModalBuilder {
	const modal = new ModalBuilder().setCustomId('response-add').setTitle('Add Response');

	const keywordLabel = new LabelBuilder()
		.setLabel('Keyword')
		.setTextInputComponent(
			new TextInputBuilder()
				.setStyle(TextInputStyle.Short)
				.setCustomId('keyword')
				.setRequired(true)
				.setValue(keyword)
		);

	const nameLabel = new LabelBuilder()
		.setLabel('Response Name')
		.setTextInputComponent(
			new TextInputBuilder().setStyle(TextInputStyle.Short).setCustomId('name').setRequired(true)
		);

	const messageLabel = new LabelBuilder()
		.setLabel('Response Message')
		.setTextInputComponent(
			new TextInputBuilder()
				.setStyle(TextInputStyle.Paragraph)
				.setCustomId('message')
				.setRequired(true)
		);

	modal.addLabelComponents(keywordLabel, nameLabel, messageLabel);
	return modal;
}
