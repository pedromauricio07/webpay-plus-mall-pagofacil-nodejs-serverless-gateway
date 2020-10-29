'use strict';

const Trx = require("../models/TbkTrxs");
const WebpayplusRest = require("../services/WebpayplusREST");


module.exports.payTransaction = async (event, context, callback) => {
    console.log(event);
    try {
        const getTrx = await Trx.getByAuthorization(event.headers.Authorization);
        //Check if result from finding the transaction from the Authorization header is not null
        if (getTrx == null) {
            const body = JSON.stringify('message: Transaccion no encontrada')
            return {
                statusCode: 404,
                body: body
            }
        } else {
            //CHECK if transaction is COMPLETED or not
            if (getTrx.estado == "COMPLETADA") {
                //Transaction already payed. Redirect to commerce             
                callback(
                    null, {
                        statusCode: 301,
                        headers: {
                          Location: process.env.BASE_URL + "/payTransaction?Authorization=" + event.headers.Authorization,
                        },
                        body: '',
                      }
                );
            } else {
                console.log("Aún no completada, se procede al pago");
                //Generate WEBPAYPLUS-REST object
                const webpayplus = new WebpayplusRest();
                const resultado = await webpayplus.initTransaction(getTrx, event.headers.Authorization);

                //Store the Token related to the transaction
                console.log('Resultado de initTransaction:', resultado);
                await webpayplus.addMetaTrx(getTrx.id, "_webpayplus-rest", resultado.token);
                context.succeed(webpayplus.getHtmlTransitionPage(resultado.url, resultado.token))
            }
        }
    } catch (err) {
        const body = JSON.stringify('message: Página no encontrada')
        return {
            statusCode: 404,
            body: body
        }
    }
  };