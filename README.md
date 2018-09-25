# ejemploDynamoDB
un ejemplo de un servicio hecho para dynamoDB

los entrypoints son: 

POST localhost:3000/envios
body: {
	"destino": "un destino",
	"enail": "un email"
}
crea un envio

POST localhost:3000/envios/{idEnvio}/movimiento
body: {
	"descripcion": "una descripcion"
}
Esto genera un movimiento en un envio

GET localhost:3000/envios/pendientes
muestra todos los envios pendientes

GET localhost:3000/envios/{idEnvio}
muestra datos de un envio en particular

POST localhost:3000/envios/{idEnvio}/entregado
marca un envio como entregado quitando el atributo pendiente
