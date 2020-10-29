/* jshint indent: 2 */
'use strict';
const db = require('../config/db');

const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

const ServiciosTbk = sequelize.define(
	'serviciosTbk',
	{
		id: {
			type: Sequelize.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		owner: {
			type: Sequelize.INTEGER(11),
			allowNull: true,
			references: {
				model: 'user',
				key: 'id'
			},
			field: 'owner'
		},
		nombreComercio: {
			type: Sequelize.STRING(100),
			allowNull: true,
			defaultValue: 'NOMBRE COMERCIO',
			field: 'nombreComercio'
		},
		tokenService: {
			type: Sequelize.STRING(255),
			allowNull: false,
			field: 'token_service'
		},
		tokenSecret: {
			type: Sequelize.STRING(255),
			allowNull: false,
			field: 'token_secret'
		},
		recurrencia: {
			type: Sequelize.ENUM('MENSUAL', 'ANUAL', 'VARIABLE'),
			allowNull: false,
			defaultValue: 'MENSUAL',
			field: 'recurrencia'
		},
		tipo: {
			type: Sequelize.ENUM('WOOCOMMERCE', 'SHOPIFY', 'CUSTOM', 'PRESTASHOP', 'MAGENTO', 'SIN ECOMMERCE'),
			allowNull: true,
			defaultValue: 'SIN ECOMMERCE',
			field: 'tipo'
		},
		codigoComercio: {
			type: Sequelize.STRING(45),
			allowNull: true,
			field: 'codigo_comercio'
		},
		callbackUrl: {
			type: Sequelize.STRING(255),
			allowNull: false,
			field: 'callbackUrl'
		},
		returnUrl: {
			type: Sequelize.STRING(255),
			allowNull: false,
			field: 'returnUrl'
		},
		createdAt: {
			type: Sequelize.DATE,
			allowNull: false,
			field: 'created_at'
		},
		updatedAt: {
			type: Sequelize.DATE,
			allowNull: false,
			field: 'updated_at'
		},
		urlServicio: {
			type: Sequelize.STRING(255),
			allowNull: false,
			field: 'url_servicio'
		},
		archived: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
			defaultValue: '0',
			field: 'archived'
		},
		deletedAt: {
			type: Sequelize.DATE,
			allowNull: true,
			field: 'deleted_at'
		},
		isDeleted: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
			defaultValue: '0',
			field: 'is_deleted'
		},
		habilitado: {
			type: Sequelize.INTEGER(1),
			allowNull: true,
			defaultValue: '0',
			field: 'habilitado'
		},
		idPlan: {
			type: Sequelize.INTEGER(11),
			allowNull: true,
			defaultValue: '2',
			references: {
				model: 'plan_planesTipo',
				key: 'id'
			},
			field: 'idPlan'
		},
		validoHasta: {
			type: Sequelize.DATEONLY,
			allowNull: true,
			defaultValue: '2016-12-16',
			field: 'valido_hasta'
		}
	},
	{
		tableName: 'servicios_tbk'
	}
);

/**
 * Retornamos la promesa.
 * Para ser retornado el servicio debe de estar habilitado,
 * y no borrado
 * @param {*} token 
 */
ServiciosTbk.getByTokenService = function(token) {
	let resultado = ServiciosTbk.findOne({
		where: {
			token_service: token,
			isDeleted: 0,
			habilitado: 1
		},

		attributes: [ 'id', 'nombreComercio', 'tokenService', 'tokenSecret', 'callbackUrl', 'returnUrl', 'urlServicio' ]
	});

	// console.log(resultado);
	return resultado;
};

ServiciosTbk.getById = function(idTrx) {
	let resultado = ServiciosTbk.findOne({
		where: {
			id: idTrx,
			habilitado: 1
		},

		attributes: [ 'id', 'nombreComercio', 'urlServicio', 'codigo_comercio' ]
	});

	// console.log(resultado);
	return resultado;
};

module.exports = ServiciosTbk;
