import express from "express";
const app = express.Router();
import connection from '../db/connection.js'

app.get('/top5', (req, res) => {
    const sql = `SELECT book.id, book.bookName, book.author, book.genre, COUNT(*) AS count 
                 FROM borrowedbooks 
                 INNER JOIN book ON borrowedbooks.bookId = book.id 
                 GROUP BY book.id 
                 ORDER BY count DESC 
                 LIMIT 5`;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error retrieving top 5 borrowed books' });
            return;
        }

        res.json(results);
    });
});


// get top 5 books for each genre
app.get('/topGenreBooks', (req, res) => {
    let sql = 'SELECT borrowedbooks.bookId, book.bookName, book.author, book.genre, COUNT(*) AS count FROM borrowedbooks JOIN book ON borrowedbooks.bookId = book.id GROUP BY borrowedbooks.bookId ORDER BY count DESC LIMIT 5';
    connection.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

app.get('/genreCount', (req, res) => {
    const sql = 'SELECT genre, COUNT(*) AS count FROM book GROUP BY genre';
    connection.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: 'Error retrieving genre count' });
      } else {
        res.json(results);
      }
    });
  }); 

export default app;