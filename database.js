import defineMessage from './models/message.js';
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
config();

const { DB_NAME, DB_USER, DB_PWD, DB_HOST } = process.env;
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PWD, {
	storage: `${DB_NAME}.sqlite`,
	dialect: 'sqlite',
	logging: false,
	host: DB_HOST,
});
const Message = defineMessage(sequelize);

sequelize.sync();

export { sequelize, Message };
