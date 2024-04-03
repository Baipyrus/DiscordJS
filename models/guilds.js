import { DataTypes, Sequelize } from 'sequelize';

/**
 * @typedef {Object} Guild
 * @property {string} id A Discord guild ID.
 * @property {(model: Object) => void} hasMany Defines an One-To-Many relationship.
 * @property {(conditions: Object) => Promise<Guild>} findOne Finds one instance in the database matching the provided condition(-s).
 * @property {(conditions: Object) => Promise<Array<Guild>>} findAll Finds all instances in the database matching the provided condition(-s).
 * @property {(conditions: Object) => Promise<Guild>} findOrCreate Finds or creates an instance in the database matching the provided condition(-s) or default values.
 */

/**
 * The definition of the `Guild` table in the database.
 * @param {Sequelize} sequelize
 */
export default function (sequelize) {
	return sequelize.define('Guilds', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		}
	});
}
