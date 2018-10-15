const restify = require('restify');
const corsMidWare = require('restify-cors-middleware');

const server = restify.createServer({
    name: 'Web API MenKeu',
    version: '1.0.0'
});

//Render index.html
server.get('/', restify.plugins.serveStatic({
    directory: __dirname,
    default: '/index.html'
}));

//Body parser
server.use(restify.plugins.bodyParser());

//Query parser
server.use(restify.plugins.queryParser());

const cors = corsMidWare({
    origins: ['*'],
    allowHeaders: ['X-App-Version'],
    exposeHeaders: []
});

server.pre(cors.preflight);
server.use(cors.actual);

//Global Configuration
global.config = require('./base/config');

//configuration reset
//global.setConfig = require('./base/resetConfig');

//Verify Token
global.verifyToken = require('./base/verifyToken');

//Sample route
require('./controllers/sampleController')(server);

//User route
require('./controllers/userController')(server);

//Category route
require('./controllers/categoryController')(server);

//Product route
require('./controllers/productController')(server);

//Order Route
require('./controllers/orderController')(server);

//HeaderDetail Route
require('./controllers/headerDetailController')(server);

server.use((error, req, res, next) => {
    console.log({
        message: error.message
    }); 
    res.status(error.status || 500);
    res.json({
        error: error.message
    });
});

server.listen(config.port, function () {
    console.log('%s listen at %s', server.name, server.url);
});