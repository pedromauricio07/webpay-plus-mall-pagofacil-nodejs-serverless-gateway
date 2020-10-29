/* jshAint indent: 2 */
'use strict';
const myAuthorizators = require('../helper/authorization.helper.js');
const myAwsHelper = require('../helper/AWS.helper');
const db = require("../config/db");

const TransactionStatus = require("../helper/transactionStatus");

const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

const Trx = sequelize.define('tbkTrxs', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  idServicio: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    defaultValue: '1',
    references: {
      model: 'servicios_tbk',
      key: 'id'
    },
    field: 'idServicio'
  },
  source: {
    type: Sequelize.STRING(64),
    allowNull: true,
    defaultValue: null,
    field: 'source'
  },
  codigoComercio: {
    type: Sequelize.STRING(45),
    allowNull: true,
    field: 'codigo_comercio'
  },
  tokenWs: {
    type: Sequelize.STRING(255),
    allowNull: true,
    field: 'token_ws'
  },
  orderIdTienda: {
    type: Sequelize.STRING(45),
    allowNull: false,
    field: 'order_id_tienda'
  },
  monto: {
    type: Sequelize.DECIMAL,
    allowNull: true,
    field: 'monto'
  },
  currency: {
    type: Sequelize.STRING(3),
    allowNull: true,
    defaultValue: 'CLP',
    field: 'currency'
  },
  idSession: {
    type: Sequelize.STRING(61),
    allowNull: false,
    field: 'id_session'
  },
  estado: {
    type: Sequelize.STRING(45),
    allowNull: false,
    defaultValue: TransactionStatus.PENDIENTE,
    field: 'estado'
  },
  email: {
    type: Sequelize.STRING(255),
    allowNull: true,
    field: 'email'
  },
  resultadoTrx: {
    type: Sequelize.STRING(45),
    allowNull: false,
    defaultValue: '',
    field: 'resultadoTRX'
  },
  authCode: {
    type: Sequelize.STRING(255),
    allowNull: true,
    field: 'auth_code'
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'updated_at'
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'created_at'
  },
  xUrlCallback: {
    type: Sequelize.STRING(255),
    allowNull: true,
    field: 'x_url_callback'
  },
  xUrlCancel: {
    type: Sequelize.STRING(255),
    allowNull: true,
    field: 'x_url_cancel'
  },
  xUrlComplete: {
    type: Sequelize.STRING(255),
    allowNull: true,
    field: 'x_url_complete'
  },
  ipaddress: {
    type: Sequelize.STRING(45),
    allowNull: true,
    field: 'ipaddress'
  },
  browserdata: {
    type: Sequelize.TEXT,
    allowNull: true,
    field: 'browserdata'
  },
  esManual: {
    type: Sequelize.INTEGER(1),
    allowNull: false,
    defaultValue: '0',
    field: 'esManual'
  }
}, {
  tableName: 'tbk_trxs'
});

/**
 * 
 * @param {*} idServicio 
 * @param {*} idStore 
 * @param {*} idSession 
 * @param {*} currency 
 * @param {*} monto 
 */
Trx.getOrCreate = function (idServicio, idStore, idSession, currency, monto) {
  return new Promise((resolve, reject) => {
    Trx.findOne({
      where: {
        idServicio: idServicio,
        orderIdTienda: idStore,
        idSession: idSession,
        currency: currency,
        monto: monto
      }
    }).then((resultado) => {
      // If the transaction does not exist we shall create it.
      if (resultado != null) {
        //Transaction is present.
        // console.log("Transacción existe", resultado);
        resultado.esNuevo = false;
        resolve(resultado);

      } else {
        //There is no transaction yet
        // console.log("Transaccion no existe, la creamos.");
        let newTrx = Trx.build({
          idServicio: idServicio,
          orderIdTienda: idStore,
          monto: monto,
          currency: currency,
          idSession: idSession,
          created_at: new Date(),
          updated_at: new Date(),
        });
        // console.log(newTrx);
        newTrx.save().then((resultado => {
          resultado.esNuevo = true;
          resolve(resultado);
        })).catch((errors) => {
          //console.log(errors)
          reject(errors);
        });
      }
    }).catch((errors) => {
      //console.log(errors);
      reject(errors);
    });
  })


}

Trx.getByAuthorization = function (Authorizator) {
  let credentials = myAuthorizators.decodeAuthHeader(Authorizator);
  if (credentials != null) {
    let getTrx = Trx.findOne({
      where: {
        id: credentials[0],
        idSession: credentials[1],
      }
    });

    return getTrx;
  } else {
    return null;
  }
};

Trx.getById = function (id) {
  return new Promise((resolve, reject) => {
    Trx.findOne({
      where: {
        id: id,
      }
    }).then((resultado) => {
      if (resultado != null) {
        //Transaccion existe.
        resolve(resultado);

      } else {
        resolve(false);
      }
    }).catch((errors) => {
      //console.log(errors);
      reject(errors);
    });
  })


}

Trx.getByTokenWS = function (tokenWs) {

  //console.log("SE BUSCA TRX CON TOKEN", tokenWs);

  let getTrx = Trx.findOne({
    where: {
      tokenWs: tokenWs,
    }
  });

  return getTrx;

};

/**
 * Function to finalize the transaction
 * @param {*} trx 
 * @param {*} source 
 * @param {*} codigoComercio 
 * @param {*} authCode 
 * @param {*} tokenWs 
 */
Trx.completeTrx = function (trx, source = null, codigoComercio = null, authCode = null, tokenWs = null, mensaje = {}) {
  // console.log("Servicio dentro", servicio);
  trx.estado = TransactionStatus.COMPLETADA;

  if (source != null) trx.source = source;
  if (codigoComercio != null) trx.codigoComercio = codigoComercio;
  if (tokenWs != null) trx.tokenWs = tokenWs;

  //console.log("Completando Transacción", "Source :", source);
  //console.log("Código de comercio asociado a la transacción", codigoComercio);
  //console.log("Código de comercio asociado a la transacción1", trx.codigoComercio);

  trx.authCode = authCode;
  trx.updatedAt = new Date();

  return trx.save().then((trxResult) => {
    //Obtain the related service
    mensaje.trx = trxResult;

    // console.log("Objeto a enviar", mensaje);
    //TODO: Publish SNS
    //myAwsHelper.publishToSNS(mensaje);
  }).catch((error) => {
    //console.log("Error al Completar la transaccion", error);
  });
}

module.exports = Trx;