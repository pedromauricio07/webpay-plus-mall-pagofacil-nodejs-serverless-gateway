/**
 * Generates an authenticator to use with TRXs
 * @param {*} idTrx 
 * @param {*} idSession 
 */
function generateAuthHeader(idTrx, idSession) {
    let authHeader = "";
    let beforeEncode = idTrx + ":" + idSession;
    authHeader = Buffer.from(beforeEncode).toString('base64');
    return authHeader;
}

/**
 * Obtaining an array with idTrx and IdSession
 * desde un Auth en Base64
 * @param {*} authHeader 
 */
function decodeAuthHeader(authHeader) {

    console.log("A decodificar", authHeader);

    let decodedHeader = Buffer.from(authHeader, 'base64').toString();
    let decodedArray = decodedHeader.split(":");

    //If the length is not 2, there is something wrong
    if (decodedArray.length != 2) {
        return null;
    } else {
        return decodedArray;
    }

}


module.exports = {
    decodeAuthHeader: decodeAuthHeader,
    generateAuthHeader: generateAuthHeader,
}