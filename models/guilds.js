import { DataTypes, Sequelize } from 'sequelize';

/**
 * @typedef {Object} Guild
 * @property {string} id A Discord guild ID.
 */

/**
 * The definition of the `Guilds` table in the database.
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
