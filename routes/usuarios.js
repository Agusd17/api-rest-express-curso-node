const express = require('express');
const Joi = require('joi'); // para validar los datos
const router = express.Router();

// Data de ejemplo
const usuarios = [
    {id: 1, name: 'Fernando'},
    {id: 2, name: 'Maria'},
    {id: 3, name: 'Pedro'},
    {id: 4, name: 'Javier'},
    {id: 5, name: 'Luis'},
    {id: 6, name: 'Juan'}
]

router.get('/', (req, res) => {
    res.send(usuarios) 
 });
 
 // :id es un parametro de la peticion
 router.get('/:id', (req, res) => {
     const usuario = existeUsuario(req.params.id);
     const index = usuarios.indexOf(usuario);
 
     if (!usuario) res.status(404).send('Usuario no encontrado');
     
     // si no se encuentra el ID, retorno un 404 con un mensaje de error
     // si se encuentra el ID, retorno el usuario
     res.send(usuarios[index]);
 })
 
 // si bien la ruta es la misma que para el metodo GET, la peticion es POST, por lo que express sabe que es un POST
 router.post('/', (req, res) => {
 
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
 
 router.put('/:id', (req, res) => {
 
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
 
 router.delete('/:id', (req, res) => {
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

module.exports = router;
