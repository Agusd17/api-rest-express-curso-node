const debug = require('debug')('app:init'); // el segundo parametro responde al valor de la variable de entorno DEBUG, por ejemplo DEBUG=app.inicio
// const dbDebug = require('debug')('app:db'); // si hacemos un export DEBUG=app.* habilitaremos ambos debugs
const express = require('express'); // para crear el servidor
const config = require('config');
const dotenv = require('dotenv').config(); // para leer el archivo .env de variables de entorno, en la raiz del proyecto
const Joi = require('joi'); // para validar los datos
// const logger = require('./logger');
const morgan = require('morgan');

const app = express(); // inicializacion del servidor


// MIDDLEWARES
// los Middlewares se ejecutan antes de las rutas

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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

const usuarios = [
    {id: 1, name: 'Fernando'},
    {id: 2, name: 'Maria'},
    {id: 3, name: 'Pedro'},
    {id: 4, name: 'Javier'},
    {id: 5, name: 'Luis'},
    {id: 6, name: 'Juan'}
]

app.get('/api/usuarios', (req, res) => {
   res.send(usuarios) 
});

// :id es un parametro de la peticion
app.get('/api/usuarios/:id', (req, res) => {
    const usuario = existeUsuario(req.params.id);
    const index = usuarios.indexOf(usuario);

    if (!usuario) res.status(404).send('Usuario no encontrado');
    
    // si no se encuentra el ID, retorno un 404 con un mensaje de error
    // si se encuentra el ID, retorno el usuario
    res.send(usuarios[index]);
})

// si bien la ruta es la misma que para el metodo GET, la peticion es POST, por lo que express sabe que es un POST
app.post('/api/usuarios', (req, res) => {

    let body = req.body;
    console.log(body);

    // defino un schema para validar el body

    // valido el body de la peticion con el schema, y lo asigno desestructurado a una constante
    const { error, value} = validarUsuario(req.body.name);

    if (!error) {
        const usuario = {
            // id must be 1 higher than the currently higher id in the usuarios array
            id: usuarios[usuarios.length - 1].id + 1,
            // value viene del schema
            name: value.name
        };
        // uso un try catch para intentar registrar el usuario
        // si la operacion falla, envio un 400, sino un 201
        try {
            usuarios.push(usuario);
            res.status(201).send(usuario);
        } catch (error) {
            res.status(400).send('Error al registrar el usuario');
        }    
    } else {
        res.status(400).send(error.details[0].message);
    }
    
})

app.put('/api/usuarios/:id', (req, res) => {

    // it is worth mentioning that conditional updating 
    // (i.e. updating a user's name if the current name is different) 
    // should be considered in some scenarios
    // this strategy might save resources, bandwith and extra processing time
    // for now, we will not consider this strategy
    
    const { error, value } = validarUsuario(req.body.name, true, req.params.id);
    
    if (!error) {
        try {
            if (!existeUsuario(req.params.id)) return res.status(404).send('Usuario no encontrado');

            const usuario = existeUsuario(req.params.id);

            let index = usuarios.indexOf(usuario);
            usuarios[index] = {
                id: usuarios[index].id,
                name: value.name
            }
            res.status(200).send(usuarios[index]);

        } catch (error) {
            res.status(400).send(`Error al modificar el usuario, ${error}`);
        }
    } else {
        res.status(400).send(error.details[0].message);
    }

    
})

app.delete('/api/usuarios/:id', (req, res) => {
    try {
        // remuevo el usuario cuyo ID es igual al parametro recibido, del array usuarios
        if (!req.params.id) return res.status(400).send('El ID es requerido');

        const usuario = existeUsuario(req.params.id);
        const index = usuarios.indexOf(usuario);

        if (!index) {

            return res.status(404).send('Usuario no encontrado')

        } else {

            usuarios.splice(index, 1);
            res.status(200).send(usuario);

        }
    } catch (error) {
        res.status(400).send('Error al eliminar el usuario');
    }
})

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

function existeUsuario(idUsuario) {
    return usuarios.find(user => user.id === +idUsuario) || null;
}

function validarUsuario(name, hasID = false, id = null) {

    // not ideal because structure name is identical in both schemas

    const schema = Joi.object({
        name: Joi.string()
        .min(3)
        .max(30)
        .required(),
    });

    const combinedSchema = Joi.object({
        name: Joi.string()
        .min(3)
        .max(30)
        .required(),
        id: Joi.number()
        .integer()
        .required()
    });

    if (hasID) {
        return combinedSchema.validate({name, id})
    } 

    return schema.validate({name});
}