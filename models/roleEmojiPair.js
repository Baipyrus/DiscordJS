import { DataTypes } from "sequelize";

export default function(sequelize) {
	return sequelize.define('RoleEmojiPair', {
		id: {
			defaultValue: DataTypes.UUIDV4,
			type: DataTypes.UUID,
			primaryKey: true,
		},
		role: {
			type: DataTypes.STRING,
		},
		emoji: {
			type: DataTypes.STRING,
		}
	});
}
