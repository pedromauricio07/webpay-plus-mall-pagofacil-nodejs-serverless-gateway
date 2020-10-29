const myAWS = require('../helper/AWS.helper');
const ServiciosTbk = require("./ServiciosTbk");


class Payment {


    constructor() {

    }

    initTransaction(props) {

    }



    /**
     * Inserta un valor en la tabla de metas asociadas a las transacciones.
     * @param {*} idTrxs 
     * @param {*} meta_key 
     * @param {*} meta_value 
     */
    addMetaTrx(idTrxs, meta_key, meta_value) {
        return myAWS.addMetaTrx(idTrxs, meta_key, meta_value);
    }

    /**
     * Obtiene un valor meta a partir del key y la TRX
     * @param {*} idTrxs 
     * @param {*} meta_key 
     */
    getMetaTrx(idTrxs, meta_key) {
        return new Promise((resolve, reject) => {
            myAWS.getMetaTrx(idTrxs, meta_key).then(result => {
                console.log("DATA ITEM", result);
                if (result.data.Item != undefined) {
                    resolve(result.data.Item);
                } else {
                    resolve(null);
                }

            }).catch(errorDynamo => {
                resolve(null);
            });
        })


    }


    addTrxDetails(idTrx, detailsTrx) {
        return new Promise((resolve, reject) => {
            myAWS.addTrxDetails(idTrx, detailsTrx, this.source).then(result => {
                resolve(result)
            }).catch(error => {
                console.log(error);
                reject(error)
            });
        })

    }

    /**
     * Obtiene un valor meta a partir del key y la TRX
     * @param {*} idTrxs 
     * @param {*} meta_key 
     */
    static getMetaTrxStatic(idTrxs, meta_key) {
        return new Promise((resolve, reject) => {
            myAWS.getMetaTrx(idTrxs, meta_key).then(result => {
                console.log("DATA ITEM", result);
                if (result.data.Item != undefined) {
                    resolve(result.data.Item);
                } else {
                    resolve(null);
                }

            }).catch(errorDynamo => {
                resolve(null);
            });
        })


    }


    /**
     * Esta funcion marca la orden como completada
     * @param {*} getTrx Corresponde al objeto transaccion
     * @param {*} authCode Corresponde al còdigo de autorización en caso de existir
     * @param {*} details  //Corresponde a un objeto con todo lo que quiera agregar
     * @param {*} codigoComercio  //Corresponde al còdigo de comercio asociado al medio de pago.
     */
    completeTrx = async (getTrx, authCode = null, details = {}, codigoComercio = null) => {

        await myAWS.addTrxDetails(getTrx.id, details, this.source);
        
        return new Promise((resolve, reject) => {
            ServiciosTbk.findById(getTrx.idServicio).then((servicio) => {

                console.log("Servicio Encontrado", servicio);
                let mensaje = {
                    servicio,
                    details: details
                };
                Trx.completeTrx(
                    getTrx,
                    this.source,
                    codigoComercio,
                    authCode,
                    getTrx.tokenWs,
                    mensaje).then(() => {
                    resolve(true);
                }).catch(error => {
                    console.log(error);
                    resolve(false);
                });;

            }).catch((errors) => {
                console.log("Servicio no encontrado", errors);
                resolve(false);
            });
        });

    }

    /**
     * Change transaction status to Fallida
     * @param {*} getTrx 
     */
    failTrx(getTrx) {
        getTrx.estado = "FALLIDA";
        getTrx.source = this.source;

        return new Promise((resolve, reject) => {
            getTrx.save().then(() => {
                resolve(false);
            }).catch((errors) => {
                console.log(errors);
                resolve(false);
            });
        })

    }



}

module.exports = Payment;