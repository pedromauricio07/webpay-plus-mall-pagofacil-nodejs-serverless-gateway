const Payment = require("./Payment");

const myAWS = require('../helper/AWS.helper');

const axios = require('axios');

class WebpayplusREST extends Payment {

    /**
     * 
     * @param {*} credentials 
     */
    constructor() {
        super();
        this.source = "WebpayPlus";
        this.url = process.env.TBK_API_URL;
        this.return_url = `${process.env.BASE_URL}/webpayplus/returnUrl`;
        this.defaultCommerceCode = process.env.TBK_DEFAULT_WEBPAY_COMMERCE_STORE_CODE;
        this.defaultMallCode = process.env.TBK_API_KEY_ID;
        this.defaultApiSecret = process.env.TBK_API_SECRET;
    }

    /**
     * Generamos la transacción en TBK y usamos el ReturnURL correspondiente a la TRX
     * Permite inicializar una transacción en Webpay. Como respuesta a la invocación se genera un token que representa en forma única una transacción.

     * Es importante considerar que una vez invocado este método, 
     * el token que es entregado tiene un periodo reducido de vida de 5 minutos, posterior a esto el token es caducado y no podrá ser utilizado en un pago.
     * @param {*} getTrx 
     * @param {*} Authorization 
     */
    initTransaction(getTrx, Authorization) {

        var data = JSON.stringify({
            "buy_order": `${getTrx.id}`,
            "session_id": `${getTrx.idSession}`,
            "return_url": `${this.return_url}?Authorization=${Authorization}`,
            "details": [{
                "amount": getTrx.monto,
                "commerce_code": this.defaultCommerceCode,
                "buy_order": `${getTrx.id}`
            }]
        });

        var config = {
            method: 'post',
            url: `${this.url}/rswebpaytransaction/api/webpay/v1.0/transactions`,
            headers: {
                'Tbk-Api-Key-Id': this.defaultMallCode,
                'Tbk-Api-Key-Secret': this.defaultApiSecret,
                'Content-Type': 'application/json'
            },
            data: data
        };

        //console.log("Create Transaction", config);
        



        return new Promise(async (resolve, reject) => {
            await myAWS.logToDynamo(getTrx.id, config, "webpayrest-create-transaction-payload");
            let result = await axios(config)
            if(result.status==200){
                await myAWS.logToDynamo(getTrx.id, result.data, "webpayrest-create-transaction-payload-result", "SUCCESS");
                resolve(result.data);
            } else {
                await myAWS.logToDynamo(getTrx.id, result.data, "webpayrest-create-transaction-payload-result", "ERROR");
                reject(result.error)
            }    
        })

    }

    /**
     * Permite confirmar una tranascción y obtener el resultado de la transacción una vez que Webpay ha resuelto su autorización financiera.
     * @param {*} token_ws 
     * @param {*} trxId 
     */
    commitTransaction(token_ws, trxId) {
        const config = {
            method: 'put',
            url: `${this.url}/rswebpaytransaction/api/webpay/v1.0/transactions/${token_ws}`,
            headers: {
                'Tbk-Api-Key-Id': this.defaultMallCode,
                'Tbk-Api-Key-Secret': this.defaultApiSecret,
            }
        };

        //console.log("Commit Transaction", config);


        return new Promise(async (resolve, reject) => {
            await myAWS.logToDynamo(trxId, config, "webpayrest-commit-transaction-payload");
            axios(config)
                .then(async (response) => {
                    console.log("Commit Transaction DATA Response", response.data, JSON.stringify(response.data));
                    await myAWS.logToDynamo(trxId, response.data, "webpayrest-commit-transaction-payload-result", "SUCCESS");
                    resolve(response.data);
                })
                .catch(async (error) => {
                    console.log(error);
                    await myAWS.logToDynamo(trxId, response.data, "webpayrest-commit-transaction-payload-result", "ERROR");
                    reject(error);
                });
        })
    }


    getHtmlTransitionPage(urlRedirection, token_ws) {
        return `<html><head><style>
        html,body { margin: 0; padding: 0; height: 100%; width: 100%; }1
        form { display: none;}</style></head>
        <body onload="document.getElementById('form').submit();">
        <form action="${urlRedirection}" method="post" id="form"><input name="token_ws" value="${token_ws}"></form></body></html>`;
    }

}


module.exports = WebpayplusREST;