import { DataTypes, Deferrable, Sequelize } from 'sequelize';

/**
 * @typedef {Object} Message
 * @property {string} id A Discord message ID.
 * @property {string} guild A Discord guild ID as a foreign key reference.
 */

/**
 * The definition of the `Messages` table in the database.
 * @param {Sequelize} sequelize
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
