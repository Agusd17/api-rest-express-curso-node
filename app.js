const debug = require('debug')('app:init'); // el segundo parametro responde al valor de la variable de entorno DEBUG, por ejemplo DEBUG=app.inicio
// const dbDebug = require('debug')('app:db'); // si hacemos un export DEBUG=app.* habilitaremos ambos debugs
const usuarios = require('./routes/usuarios');
const express = require('express'); // para crear el servidor
const config = require('config');
const dotenv = require('dotenv').config(); // para leer el archivo .env de variables de entorno, en la raiz del proyecto
// const logger = require('./logger');
const morgan = require('morgan');

const app = express(); // inicializacion del servidor


// MIDDLEWARES
// los Middlewares se ejecutan antes de las rutas

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/api/usuarios', usuarios); // cuando entremos por la url /api/usuarios, ejecutaremos las rutas de usuarios

// app.use(logger);
console.log('Aplicación: ' + config.get('nombre'));
console.log('DB server: ' + config.get('configDB.host'));

// para cambiar de entorno se puede usar el comando de linea "export NODE_ENV=production"


// middleware de terceros
if (app.get('env') === 'development') {   
    app.use(morgan('tiny')); // me permite logear las peticiones HTTP, describiendo metodo, url, codigo de respuesta, tiempo de respuesta, etc
    // console.log('Morgan iniciado');
    debug('Morgan iniciado');
}

//Trabajos con la DB
debug('Conectando a la DB');


// RUTAS

// peticion
// app.get('/', (req, res) => {
//     // res (response) representa la respuesta que enviaremos al cliente
//     res.send('Hola Mundo desde Express');
// });

// envio
// app.post(); 

// modificacion
// app.put(); 

// eliminacion
// app.delete(); 

// ejemplo
// app.get('/api/usuarios/:year/:month', (req, res) => { 
//     // res.send permite retornar un objeto json a la peticion
//     // que puede estar compuesto como queramos
//     res.send({params: req.params, query: req.query});
// })

// port tomara la variable de entorno definida, si existe, sino 3000
const port =  process.env.PORT || 3000; 

// abro la comunicacion por el puerto 3000
app.listen(port, () => {
    console.log(`Servidor express escuchando en el puerto ${port}...`);
})