import { DataTypes } from "sequelize";

export default function(sequelize) {
	return sequelize.define('Message', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		roleEmojiPair: {
			deferrable: Deferrable.INITIALLY_IMMEDIATE,
			model: 'RoleEmojiPair',
			key: 'id',
		},
	});
}
