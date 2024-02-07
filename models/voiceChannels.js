import { DataTypes } from 'sequelize';

export default function(sequelize) {
	return sequelize.define('VoiceChannel', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		create: {
			type: DataTypes.BOOLEAN
		},
		owner: {
			type: DataTypes.STRING,
			defaultValue: false,
			allowNull: true
		}
	});
}
