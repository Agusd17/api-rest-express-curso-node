function log(req, res, next) {
    console.log('Soy un logger middleware');
    next();
}

module.exports = log;