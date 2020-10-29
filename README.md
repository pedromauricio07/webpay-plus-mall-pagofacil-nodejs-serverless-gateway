# webpay-plus-mall-pagofacil-nodejs-serverless-gateway
serverless create --template aws-nodejs --path webpay-plus-mall-pagofacil-nodejs-serverless-gateway

# start offline
npm run start-offline

# run dynamoDB local db
C:\Program Files\DynamoDB-local>java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

# run local dynamoDB client
dynamodb-admin

# run mysql on local vm
~/Workspace/pagofacil/development-database
vagrant up db-server

