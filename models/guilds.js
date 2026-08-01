import { DataTypes, Sequelize } from 'sequelize';

/**
 * @typedef {object} Guild
 * @property {string} id A Discord guild ID.
 */

/**
 * The definition of the `Guilds` table in the database.
 * @param {Sequelize} sequelize
 * @returns {ReturnType<typeof Sequelize.prototype.define>}
 */
export default function (sequelize) {
	return sequelize.define('Guilds', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		}
	});
}
