import { DataTypes, Sequelize } from 'sequelize';

/**
 * @typedef {Object} Message
 * @property {string} id A Discord message ID.
 * @method hasMany Defines an One-To-Many relationship.
 * @param {Object}
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
