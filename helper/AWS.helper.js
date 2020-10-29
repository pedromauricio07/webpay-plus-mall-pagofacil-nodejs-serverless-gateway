const AWS = require('aws-sdk');
const DYNAMO_CONF = {
    region: process.env.REGION || 'us-west-2',
    endpoint: "http://localhost:8000",
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey"
};

AWS.config.update(DYNAMO_CONF);
const docClient = new AWS.DynamoDB.DocumentClient();


/**
 * 
 * @param {*} idTrxs 
 * @param {*} body 
 * @param {*} key 
 * @param {*} type 
 */ 
const logToDynamo = (idTrxs, body, key = null, type = "INFO") => {
    return new Promise(function (resolve, reject) {

        
        let filteredValue = JSON.stringify(body);
        let format = "JSON-STRINGIFY";

        console.log("Filtered Value", filteredValue);

        const params = {
            TableName: process.env.LOGGER_DYNAMO,
            Item: {
                idTrxs: "" + idTrxs,
                timestamp: Date.now(),
                key: key,
                type: type,
                format: format,
                value: filteredValue,
            },
            ReturnValues: "ALL_OLD"
        };
        // console.log("Params PUT: ");
        // console.log(params);
        docClient.put(params, function (err, data) {
            if (err) { // an error occurred
                console.log("NO SE PUDO AGREGAR LOG DE TRANSACCION");
                console.log(err, err.stack);
                return reject({
                    err: err
                });
            } else {
                console.log(key, "LOG TRANSACCION AGREGADO SIN PROBLEMAS");
                // console.log(data);
                return resolve({
                    data: data
                });

            }
        });
    });
};

/**
 * 
 * @param {*} idTrxs 
 * @param {*} details 
 * @param {*} source 
 * @param {*} type 
 */
const addTrxDetails = (idTrxs, details = {}, source = null, type = "JSON") => {
    return new Promise(function (resolve, reject) {

        let filteredDetails = removeEmptyStringElements(details);
        console.log("Filtered Details", filteredDetails);

        const params = {
            TableName: process.env.DYNAMO_TRXS_DETAILS,
            Item: {
                idTrxs: "" + idTrxs,
                timestamp: Date.now(),
                details: filteredDetails,
                source: source,
                type: type
            },
            ReturnValues: "ALL_OLD"
        };
        console.log("Params PUT addTrxDetails: ");
        console.log(params);
        docClient.put(params, function (err, data) {
            if (err) { // an error occurred
                console.log("NO SE PUDIERON AGREGAR LOS DATOS DE LA TRANSACCIÓN");
                console.log(err, err.stack);
                return reject({
                    err: err
                });
            } else {
                console.log("DATOS DE LA TRANSACCIÓN AGREGADOS SIN PROBLEMAS");
                console.log(data);
                return resolve({
                    data: data
                });

            }
        });
    });
};


/**
 * Inserts an assigned meta value to a META KEY. If it is already there it should overwrite it.
 * @param {*} idTrxs 
 * @param {*} meta_key 
 * @param {*} meta_value 
 */
const addMetaTrx = (idTrxs, meta_key, meta_value) => {
    return new Promise(function (resolve, reject) {

        let filteredValues = removeEmptyStringElements(meta_value);
        console.log("Filtered Values", filteredValues);

        const params = {
            TableName: process.env.DYNAMO_TRXS_META,
            Item: {
                idTrxs: "" + idTrxs,
                meta_key: meta_key,
                meta_value: filteredValues,
            },
            ReturnValues: "ALL_OLD"
        };
        console.log("Params PUT addTrxMeta: ");
        console.log(params);
        docClient.put(params, function (err, data) {
            if (err) { // an error occurred
                console.log("NO SE PUDO AGREGAR META TRX");
                console.log(err, err.stack);
                return reject({
                    err: err
                });
            } else {
                console.log("META TRXS AGREGADOS SIN PROBLEMAS");
                console.log(data);
                return resolve({
                    data: data
                });

            }
        });
    });
};

const getMetaTrx = (idTrxs, meta_key) => {
    return new Promise(function (resolve, reject) {


        const params = {
            TableName: process.env.DYNAMO_TRXS_META,
            Key: {
                idTrxs: "" + idTrxs,
                meta_key: meta_key,
            },
        };
        //console.log("Params GET getMetaTrx: ", params);

        docClient.get(params, function (err, data) {
            if (err) { // an error occurred
                //console.log("NO SE PUDO OBTENER META TRX");
                //console.log(err, err.stack);
                return reject({
                    err: err
                });
            } else {
                //console.log("META TRXS RETORNADO SIN PROBLEMAS");
                //console.log(data);
                return resolve({
                    data: data
                });

            }
        });
    });
};





const publishToSNS = (mensaje) => {
    // Create publish parameters
    var params = {
        Message: JSON.stringify(mensaje),
        /* required */
        TopicArn: process.env.FINTRX_TOPIC_ARN
    };

    // Create promise and SNS service object
    var publishTextPromise = new AWS.SNS({
        apiVersion: '2010-03-31'
    }).publish(params).promise();

    // handle promise's fulfilled/rejected states
    publishTextPromise.then((data) => {
        // console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
        // console.log(params.Message);
        //console.log("MessageID is " + data.MessageId);
    }).catch((err) => {
        console.error(err, err.stack);
    });


};



/**
 * DynamoDB does not allow to insert empty data, so we should check and delete those empty values
 * @param {*} obj 
 */
function removeEmptyStringElements(obj) {
    
    Object.keys(obj).forEach((k) => (!obj[k] && obj[k] !== undefined) && delete obj[k]);
    return obj;
}


module.exports = {
    logToDynamo: logToDynamo,
    publishToSNS: publishToSNS,
    addTrxDetails: addTrxDetails,
    addMetaTrx: addMetaTrx,
    getMetaTrx: getMetaTrx
}