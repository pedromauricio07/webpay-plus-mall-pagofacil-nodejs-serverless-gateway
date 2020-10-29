'use strict';

const Trx = require("../models/TbkTrxs");
const WebpayplusRest = require("../services/WebpayplusREST");

module.exports.returnUrl = async (event, context, callback) => {
    try {
        const getTrx = await Trx.getByAuthorization(event.headers.Authorization);
        //console.log(getTrx)
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
                /*
                 * Checking if token_ws is present in DynamoDB, if there is then we have a response from TBK, 
                 * If is not there it might be an annullment
                 * */
                
                const token_ws = JSON.stringify(event.body).slice(22).slice(1, -8);;
                

                if (token_ws != undefined) {
                    //If there is a token, the status of the transaction should be checked. Also checking if the token matches up.
                    const webpayplus = new WebpayplusRest();
                    const tokenEnDB = await webpayplus.getMetaTrx(getTrx.id, "_webpayplus-rest");
                    //console.log(tokenEnDB.meta_value)
                    //console.log(token_ws)
                    if (tokenEnDB.meta_value == token_ws) {
                        //token is the same which is what is expected
                        const resultadoTrx = await webpayplus.commitTransaction(token_ws, getTrx.id);
                        //console.log(resultadoTrx)
                        const responseCode = resultadoTrx.details[0].response_code;
                        console.log(responseCode)
                        console.log("Resultado de la trx :", resultadoTrx, responseCode);
                        
                        if (responseCode == 0) {
                            console.log("Response code es 0, se procede a completar la transacción.", responseCode);

                            //Completing transaction
                            await webpayplus.completeTrx(getTrx, resultadoTrx.details.authorization_code, resultadoTrx, resultadoTrx.details.commerce_code);

                            //Redirecting to success page
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
                            //Transaction failed
                            //Changing transaction status to FALLIDA
                            console.log("Response code NO es 0, se falla la transacción.", responseCode);
                            await webpayplus.failTrx(getTrx);
                            //Redirecting to payment page
                            callback(
                                null, {
                                    statusCode: 301,
                                    headers: {
                                      Location: process.env.BASE_URL + "/payTransaction?Authorization=" + event.headers.Authorization,
                                    },
                                    body: '',
                                  }
                            );
                        }
                    } else {
                        //The provided token does not match
                        context.succeed("Se recibió un token distinto al guardado para esta transacción");
                    }



                } else {
                    //TODO CAMBIAR ESTADO A FALLIDO ?
                    console.log("Vuelta desde TBK sin TOKEN WS");
                    callback(
                        null, {
                            statusCode: 301,
                            headers: {
                              Location: process.env.BASE_URL + "/payTransaction?Authorization=" + event.headers.Authorization,
                            },
                            body: '',
                          }
                    );
                }



            }


        }
    } catch(err) {
        const body = JSON.stringify('message: Página no encontrada')
        return {
            statusCode: 404,
            body: body
        }
    }
  
    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
  };