// tslint:disable
import * as Sequelize from 'sequelize';


// table: user_goodie
export interface user_goodieAttribute {
	_id:number;
	userId:number;
	goodieId:number;
	receivedOn:Date;
	createdOn:Date;
	updatedOn:Date;
}
export interface user_goodieInstance extends Sequelize.Instance<user_goodieAttribute>, user_goodieAttribute { }
export interface user_goodieModel extends Sequelize.Model<user_goodieInstance, user_goodieAttribute> { }
