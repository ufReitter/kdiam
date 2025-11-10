const clipboardy = require('clipboardy');
const objectID = require('bson-objectid');

let id = new objectID();

clipboardy.writeSync(id.str);
