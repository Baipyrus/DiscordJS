import { DataTypes } from 'sequelize';

export default function (sequelize) {
	return sequelize.define('VoiceChannel', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		create: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		owner: {
			type: DataTypes.STRING,
			allowNull: true
		}
	});
}
