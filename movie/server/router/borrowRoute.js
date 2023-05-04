import express from "express";
const app = express.Router();
import connection from '../db/connection.js'
import bcrypt from 'bcrypt'


// endpoint for borrowing a book
app.post('/book/:id', (req, res) => {
    const bookId = req.params.id;
    const { username, password } = req.body;

    // query the database to check if the user exists
    const userQuery = 'SELECT * FROM users WHERE username = ?';
    connection.query(userQuery, [username], async (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send({ error: "Internal server error" });
        }
        const user = results[0];
        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        // verify the password
        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) {
            return res.status(400).send({ error: "Password does not match" });
        }

        // query the database to check if the book exists
        const bookQuery = 'SELECT * FROM book WHERE id = ?';
        connection.query(bookQuery, [bookId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal server error');
                return;
            }

            // check if the book exists
            const book = results[0];
            if (!book) {
                res.status(404).send('Book not found');
                return;
            }

            // check if the book is already borrowed
            if (book.borrowed) {
                res.status(400).send('Book already borrowed');
                return;
            }
            const currentDate = new Date();
            const updateQuery2 = 'INSERT INTO borrowedbooks (username, borrow_date, bookId) VALUES(?,?,?)';
            connection.query(updateQuery2, [username, currentDate, bookId], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal server error');
                    return;
                }

                // res.send('Inserted borrowed book successfully');
            });
            // update the book borrowed status and due date
            const updateQuery = 'UPDATE book SET borrowed = true, due_date = DATE_ADD(NOW(), INTERVAL 1 MINUTE),borrower=? WHERE id = ?';
            connection.query(updateQuery, [username, bookId], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal server error');
                    return;
                }

                res.send('Book borrowed successfully');
            });
            //updateBorrowBook
            
        });
    });
});


// endpoint for returning a book
app.post('/return/:id', (req, res) => {
    const bookId = req.params.id;
    const {username} = req.body;
    // const username = req.query.username;
    // const bookId = req.params.id;
    // query the database to check if the user and book exist
    const selectQuery = 'SELECT * FROM users WHERE username = ?';
    connection.query(selectQuery, [username], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
            return;
        }

        // check if the user and book exist
        const user = results[0];
        // const book = results[1][0];
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        const bookQuery = 'SELECT * FROM book WHERE id = ?';
        connection.query(bookQuery, [bookId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal server error');
                return;
            }

            // check if the book exists
            const book = results[0];
        if (!book) {
            res.status(404).send('Book not found');
            return;
        }

        // check if the book is not borrowed
        if (!book.borrowed) {
            res.status(400).send('Book not borrowed');
            return;
        }

        // calculate the fine if the book is returned after the due date
        const dueDate = new Date(book.due_date);
        const currentDate = new Date();
        if (currentDate > dueDate) {
            // const daysLate = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
            const minutesLate = Math.ceil((currentDate - dueDate) / (1000 * 60));
    
            const fine = minutesLate * 0.5; // assuming a fine of 50 cents per day late
            // console.log(`Book returned ${daysLate} days late. Fine: $${fine.toFixed(2)}`);
            // save the fine to the user's database
            const updateQuery2 = 'INSERT INTO overduebooks (username, fine, bookId,duration) VALUES(?,?,?,?)';
            connection.query(updateQuery2, [username, fine, bookId, minutesLate], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal server error');
                    return;
                }

                // res.send('Inserted borrowed book successfully');
            });
            const updateQuery = 'UPDATE users SET fine = fine + ? WHERE username = ?;';
            connection.query(updateQuery, [fine, username], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal server error');
                    return;
                }
                console.log(`Fine of $${fine.toFixed(2)} added to user ${username}`);
                // update the book borrowed status and due date
                const updateBookQuery = 'UPDATE book SET borrowed = false, due_date = NULL, borrower= NULL WHERE id = ?;';
                connection.query(updateBookQuery, [bookId], (err, result) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Internal server error');
                        return;
                    }
                    res.send('Book returned successfully');
                });
            });
        } else {
            // update the book borrowed status and due date
            const updateBookQuery = 'UPDATE book SET borrowed = false, due_date = NULL,borrower=NULL WHERE id = ?;';
            connection.query(updateBookQuery, [bookId], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal server error');
                    return;
                }
                res.send('Book returned successfully');
            });
        }
    });
});
});

app.get("/bookList/:username", (req, res) => {
    const username = req.params.username;
    const sql = "SELECT * FROM book WHERE borrower = ?";
    connection.query(sql, [username], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error retrieving borrowed from database");
        } else {
            console.log(result)
            res.send(result);
        }
    });
});

export default app;