import defineRoleEmojiPair from '#models/roleEmojiPairs.js';
import defineVoiceChannel from '#models/voiceChannels.js';
import defineResponse from '#models/responses.js';
import defineMessage from '#models/messages.js';
import defineKeyword from '#models/keywords.js';
import defineGuild from '#models/guilds.js';
import defineRole from '#models/roles.js';
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

const { DB_NAME } = process.env;
/** The database instance used as an ORM in this project. */
const sequelize = new Sequelize({
	storage: `${DB_NAME}.sqlite`,
	dialect: 'sqlite',
	logging: false
});

const Responses = defineResponse(sequelize);

const Keywords = defineKeyword(sequelize);
Keywords.hasMany(Responses, { foreignKey: 'keyword', onDelete: 'CASCADE' });

const RoleEmojiPairs = defineRoleEmojiPair(sequelize);

const VoiceChannels = defineVoiceChannel(sequelize);

const Messages = defineMessage(sequelize);
Messages.hasMany(RoleEmojiPairs, { foreignKey: 'message', onDelete: 'CASCADE' });

const Roles = defineRole(sequelize);
Roles.hasMany(RoleEmojiPairs, { foreignKey: 'role', onDelete: 'CASCADE' });

const Guilds = defineGuild(sequelize);
Guilds.hasMany(Keywords, { foreignKey: 'guild', onDelete: 'CASCADE' });
Guilds.hasMany(VoiceChannels, { foreignKey: 'guild', onDelete: 'CASCADE' });
Guilds.hasMany(Messages, { foreignKey: 'guild', onDelete: 'CASCADE' });
Guilds.hasMany(Roles, { foreignKey: 'guild', onDelete: 'CASCADE' });

sequelize.sync();
export { sequelize, Guilds, Roles, Messages, VoiceChannels, RoleEmojiPairs, Keywords, Responses };
