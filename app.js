var Layout = require("./classes/app/layout"),
    Datastore = require('nedb'),
    server = require("./classes/server");

server.db = new Datastore({ filename: 'data/train.db', autoload: true });
server.layout = new Layout();

server.start();