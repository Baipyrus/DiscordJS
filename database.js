import defineRoleEmojiPair from './models/roleEmojiPairs.js';
import defineVoiceChannel from './models/voiceChannels.js';
import defineResponse from './models/responses.js';
import defineMessage from './models/messages.js';
import defineKeyword from './models/keywords.js';
import defineGuild from './models/guilds.js';
import defineRole from './models/roles.js';
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

const Response = defineResponse(sequelize);

const Keyword = defineKeyword(sequelize);
Keyword.hasMany(Response, { foreignKey: 'keyword', onDelete: 'CASCADE' });

const RoleEmojiPair = defineRoleEmojiPair(sequelize);

const VoiceChannel = defineVoiceChannel(sequelize);

const Message = defineMessage(sequelize);
Message.hasMany(RoleEmojiPair, { foreignKey: 'message', onDelete: 'CASCADE' });

const Role = defineRole(sequelize);
Role.hasMany(RoleEmojiPair, { foreignKey: 'role', onDelete: 'CASCADE' });

const Guild = defineGuild(sequelize);
Guild.hasMany(Keyword, { foreignKey: 'guild', onDelete: 'CASCADE' });
Guild.hasMany(VoiceChannel, { foreignKey: 'guild', onDelete: 'CASCADE' });
Guild.hasMany(Message, { foreignKey: 'guild', onDelete: 'CASCADE' });
Guild.hasMany(Role, { foreignKey: 'guild', onDelete: 'CASCADE' });

sequelize.sync();
export { sequelize, Guild, Role, RoleEmojiPair, VoiceChannel, Message };
