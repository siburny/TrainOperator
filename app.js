/* global global */
var server = new (require("./classes/server").server)();

var Layout = require("./classes/layout"),
    Datastore = require('nedb');

global.db = new Datastore({ filename: 'data/train.db', autoload: true });
global.layout = new Layout();

server.start();