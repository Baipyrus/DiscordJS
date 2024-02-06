import { DataTypes } from 'sequelize';

export default function (sequelize) {
	return sequelize.define('Messages', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		}
	});
}
