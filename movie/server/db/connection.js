import mysql from 'mysql'

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "iutcse",
    database: "library",
})

export default connection