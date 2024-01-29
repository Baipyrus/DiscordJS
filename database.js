import defineRoleEmojiPair from './models/roleEmojiPairs.js';
import defineVoiceChannel from './models/voiceChannels.js';
import defineMessage from './models/messages.js';
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
config();

const { DB_NAME } = process.env;
const sequelize = new Sequelize({
	storage: `${DB_NAME}.sqlite`,
	dialect: 'sqlite',
	logging: false,
});
const RoleEmojiPair = defineRoleEmojiPair(sequelize);
const VoiceChannel = defineVoiceChannel(sequelize);
const Message = defineMessage(sequelize);

sequelize.sync();

export { sequelize, RoleEmojiPair, VoiceChannel, Message };
