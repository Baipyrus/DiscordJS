import { DataTypes, Sequelize } from 'sequelize';

/**
 * @typedef {Object} VoiceChannel
 * @property {string} id A Discord channel ID.
 * @property {boolean} create Whether or not this channel is registered to create customs when joined.
 * @property {(string|null)} owner The owner of this channel, if not registered for customs.
 */

/**
 * The definition of the `VoiceChannel` table in the database.
 * @param {Sequelize} sequelize
 * @returns {VoiceChannel}
 */
export default function (sequelize) {
	return sequelize.define('VoiceChannel', {
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
		}
	});
}
