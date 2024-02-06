import { DataTypes, Deferrable } from 'sequelize';

export default function (sequelize) {
	return sequelize.define('RoleEmojiPairs', {
		id: {
			defaultValue: DataTypes.UUIDV4,
			type: DataTypes.UUID,
			primaryKey: true
		},
		message: {
			type: DataTypes.STRING,
			references: {
				deferrable: Deferrable.INITIALLY_IMMEDIATE,
				model: 'Messages',
				key: 'id'
			}
		},
		role: {
			type: DataTypes.STRING
		},
		emoji: {
			type: DataTypes.STRING
		}
	});
}
