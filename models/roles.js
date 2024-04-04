import { DataTypes, Deferrable, Sequelize } from 'sequelize';

/**
 * @typedef {Object} Role
 * @property {string} id A Discord role ID.
 * @property {boolean} assign Whether or not the role should be assigned to new members.
 * @property {string} guild A Discord guild ID as a foreign key reference.
 */

/**
 * The definition of the `Roles` table in the database.
 * @param {Sequelize} sequelize
 */
export default function (sequelize) {
	return sequelize.define('Roles', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		assign: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
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
