import express from "express";
const app = express.Router();
// const db = require('../db/connection.js');
import db from '../db/connection.js'

app.get("/api/get", (req, res) => {
    const sql = "SELECT * FROM book";
    db.query(sql, (err, result) => {
        res.send(result);
    })
})

app.get("/api/books/:id", (req, res) => {
    const bookId = req.params.id;
    const sql = "SELECT * FROM book WHERE id = ?";
    db.query(sql, [bookId], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error retrieving book from database");
        } else {
            res.send(result[0]);
        }
    });
});



app.post("/api/insert", (req, res) => {
    const bookName = req.body.bookName;
    const author = req.body.author;
    const genre = req.body.genre;

    const sql = "INSERT INTO book (bookName, author, genre) VALUES(?,?,?)"
    db.query(sql, [bookName, author, genre], (err, result) => {
        // console.log(result)
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.put("/update/:id", (req, res) => {
    const id = req.params.id;
    const bookName = req.body.bookName;
    const author = req.body.author;
    const genre = req.body.genre;
    db.query(
        "UPDATE book SET `bookName` = ?, `author`= ?, `genre`= ? WHERE `id` = ?",
        [bookName, author, genre, id],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    );
});

app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM book WHERE id = ?", id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get("/search", (req, res) => {

    const bookName = req.query.bookName;
    const criteria = req.query.criteria;
    console.log(bookName, criteria, "backend search")
    db.query(`SELECT * FROM book WHERE ${criteria} Like '${bookName}%'`, (err, result) => {
        if (err) {
            // console.log(err)
        } else res.send(result)
    })
})

export default app;