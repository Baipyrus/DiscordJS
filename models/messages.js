import { DataTypes, Sequelize } from 'sequelize';

/**
 * @typedef {Object} Message
 * @property {string} id A Discord message ID.
 * @property {(model: Object) => void} hasMany Defines an One-To-Many relationship.
 * @property {(conditions: Object) => void} findOne Finds one instance in the database matching the provided condition(-s).
 * @property {(conditions: Object) => void} findAll Finds all instances in the database matching the provided condition(-s).
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
		}
	});
}
