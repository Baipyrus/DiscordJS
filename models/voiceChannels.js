import { DataTypes, Deferrable, Sequelize } from 'sequelize';

/**
 * @typedef {Object} VoiceChannel
 * @property {string} id A Discord channel ID.
 * @property {boolean} create Whether or not this channel is registered to create customs when joined.
 * @property {(string|null)} owner The owner of this channel, if not registered for customs.
 * @property {string} guild A Discord guild ID as a foreign key reference.
 * @property {(model: Object) => void} hasMany Defines an One-To-Many relationship.
 * @property {(conditions: Object) => Promise<VoiceChannel>} findOne Finds one instance in the database matching the provided condition(-s).
 * @property {(conditions: Object) => Promise<Array<VoiceChannel>>} findAll Finds all instances in the database matching the provided condition(-s).
 * @property {(conditions: Object) => Promise<VoiceChannel>} findOrCreate Finds or creates an instance in the database matching the provided condition(-s) or default values.
 */

/**
 * The definition of the `VoiceChannel` table in the database.
 * @param {Sequelize} sequelize
 * @returns {VoiceChannel}
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
