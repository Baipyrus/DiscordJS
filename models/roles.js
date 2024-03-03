import { DataTypes, Deferrable, Sequelize } from 'sequelize';

/**
 * @typedef {Object} Role
 * @property {string} id A Discord role ID.
 * @property {boolean} assign Whether or not the role should be assigned to new members.
 * @property {string} guild A Discord guild ID as a foreign key reference.
 * @property {(model: Object) => void} hasMany Defines an One-To-Many relationship.
 * @property {(conditions: Object) => Promise<Role>} findOne Finds one instance in the database matching the provided condition(-s).
 * @property {(conditions: Object) => Promise<Array<Role>>} findAll Finds all instances in the database matching the provided condition(-s).
 * @property {(conditions: Object) => Promise<Role>} findOrCreate Finds or creates an instance in the database matching the provided condition(-s) or default values.
 */

/**
 * The definition of the `Role` table in the database.
 * @param {Sequelize} sequelize
 * @returns {Role}
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
