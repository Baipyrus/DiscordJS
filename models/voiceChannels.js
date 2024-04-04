import { DataTypes, Deferrable, Sequelize } from 'sequelize';

/**
 * @typedef {Object} VoiceChannel
 * @property {string} id A Discord channel ID.
 * @property {boolean} create Whether or not this channel is registered to create customs when joined.
 * @property {(string|null)} owner The owner of this channel, if not registered for customs.
 * @property {string} guild A Discord guild ID as a foreign key reference.
 */

/**
 * The definition of the `VoiceChannels` table in the database.
 * @param {Sequelize} sequelize
 */
export default function (sequelize) {
	return sequelize.define('VoiceChannels', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		create: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		owner: {
			type: DataTypes.STRING,
			allowNull: true
		},
		guild: {
			type: DataTypes.STRING,
			references: {
				deferrable: Deferrable.INITIALLY_IMMEDIATE,
				model: 'Guilds',
				key: 'id'
			}
		}
	});
}
