var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'b1eaf14eb820d8',
    password: '60f0e49c',
    database: 'heroku_403000bcc933982'
});

module.exports.pool = pool;

// mysql://b1eaf14eb820d8:60f0e49c@us-cdbr-east-03.cleardb.com/heroku_403000bcc933982?reconnect=true