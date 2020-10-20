// tslint:disable
import * as path from 'path';
import * as sequelize from 'sequelize';
import * as def from './db';

export interface ITables {
	user_goodie:def.user_goodieModel;
}

export const getModels = function(seq:sequelize.Sequelize):ITables {
	const tables:ITables = {
		user_goodie: seq.import(path.join(__dirname, './user_goodie')),
	};
	return tables;
};
