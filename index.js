var AWS = require('aws-sdk');

var handler = function(event, context, callback) {
  var dynamodb = new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    endpoint: 'http://dynamodb:8000',
    region: 'us-west-2',
    credentials: {
      accessKeyId: '2345',
      secretAccessKey: '2345'
    }
  });

  var docClient = new AWS.DynamoDB.DocumentClient({
     apiVersion: '2012-08-10',
     service: dynamodb
  });

  switch (event.httpMethod) {
    case "GET":
      switch (event.resource) {
        case "/envios/pendientes":

        docClient.scan({
          TableName: 'Envio',
          IndexName: 'EnviosPendientesIndex'
        }, function(err, data) {
          if (err){
            callback(null, {
              statusCode: 500, body: JSON.stringify(err)
            });
          } else {
            callback(null, {
              statusCode: 201,
              body: JSON.stringify(data)
            })
          }
        });

          break;
        case "/envios/{idEnvio}":

        let id = (event.pathParameters || {}).idEnvio || false;

          docClient.get({
            TableName : 'Envio',
            Key: {
              'id': id
            }
          }, function(err, data) {
            if (err){
              callback(null, {
                statusCode: 500, body: JSON.stringify(err)
              });
            } else {
              callback(null, {
                statusCode: 201,
                body: JSON.stringify(data)
              })
            }
          });

          break;
      }
      break;
    case "POST":
      let body = JSON.parse(event.body);
      var item = body;

      switch (event.resource) {
        case "/envios":
          // crear
          item.fechaAlta = new Date().toISOString();
          item.pendiente = item.fechaAlta;
          item.id = guid();

          console.log('item', item);

          docClient.put({
            TableName: 'Envio',
            Item: item
          }, function(err, data) {
            if (err) {
              callback(null, {
                statusCode: 500, body: JSON.stringify(err)
              });
            } else {
              callback(null, {
                statusCode: 201,
                body: JSON.stringify(item)
              })
            }
          });

          break;
        case "/envios/{idEnvio}/movimiento":

          let fechaAlta = new Date().toISOString();
          var mIdEnvio = (event.pathParameters || {}).idEnvio || false;

          docClient.get({
            TableName : 'Envio',
            Key: {
              'id': mIdEnvio
            }
          }, function(err, data) {

            let mItem = data.Item;
            mItem.fecha = fechaAlta;

            if (err){
              callback(null, {
                statusCode: 500, body: JSON.stringify(err)
              });
            } else {
              if(!mItem.Historial){
                mItem.Historial = [];
              }
              mItem.Historial.push(
                item
              );
              docClient.put({
                TableName: 'Envio',
                Item: mItem,
              }, function(err, data) {
                if (err) {
                  callback(null, {
                    statusCode: 500, body: JSON.stringify(err)
                  });
                } else {
                  callback(null, {
                    statusCode: 201,
                    body: JSON.stringify(mItem)
                  });
                }
              });
            }
          });

          // agregar movimiento
          // 1) traer por id
          // 2) agregamos historial
          // 3) put para guardar
          break;
        case "/envios/{idEnvio}/entregado":

          let id = (event.pathParameters || {}).idEnvio || false;

          docClient.update({
            TableName : 'Envio',
            Key: {
              'id': id
            },
            UpdateExpression : "REMOVE pendiente",
            ReturnValues : "UPDATED_NEW"
          }, function(err, data) {
            if (err){
              callback(null, {
                statusCode: 500, body: JSON.stringify(err)
              });
            } else {
              callback(null, {
                statusCode: 201,
                body: JSON.stringify(data)
              })
            }
          });
          // marcar entregado
          // 1) traer por id
          // 2) borrar atributo pendiente
          // 3) put para guardar
          break;
      }
      break;
    default:
      callback(null, {
        statusCode: 405
      });
  }

}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

exports.handler = handler;
