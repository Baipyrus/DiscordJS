import { DataTypes, Deferrable, Sequelize } from 'sequelize';

/**
 * @typedef {Object} Message
 * @property {string} id A Discord message ID.
 * @property {string} guild A Discord guild ID as a foreign key reference.
 * @property {(model: Object) => void} hasMany Defines an One-To-Many relationship.
 * @property {(conditions: Object) => Promise<Message>} findOne Finds one instance in the database matching the provided condition(-s).
 * @property {(conditions: Object) => Promise<Array<Message>>} findAll Finds all instances in the database matching the provided condition(-s).
 * @property {(conditions: Object) => Promise<Message>} findOrCreate Finds or creates an instance in the database matching the provided condition(-s) or default values.
 */

/**
 * The definition of the `Message` table in the database.
 * @param {Sequelize} sequelize
 * @returns {Message}
 */
export default function (sequelize) {
	return sequelize.define('Messages', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
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
