const mysql = require('mysql2/promise');

const mySqlPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Db!21R#23Qlsaz@hTw',
    database: 'qeci_enrollment',
    port : 3306
});

module.exports = mySqlPool;