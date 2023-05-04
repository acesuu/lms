import connection from "../db/connection.js";
import express from "express";
const app = express.Router();


  // define a route to get user count according to type
  app.get('/user-count', (req, res) => {
    connection.query('SELECT userType, COUNT(*) as count FROM users GROUP BY userType', (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(results);
      }
    });
  });

  app.get('/overdue',(req,res)=>{
    connection.query('SELECT * FROM overduebooks', (err,results)=>{
        if(err){
            console.log(err)
            res.status(500).send('Internal Server Error')
        }
        else res.json(results)
    })
  })

  app.get('/overdue/:username',(req,res)=>{
    const username = req.params.username;
    connection.query('SELECT * FROM overduebooks WHERE username=?',[username], (err,results)=>{
        if(err){
            console.log(err)
            res.status(500).send('Internal Server Error')
        }
        else res.json(results)
    })
  })

  app.get('/borrow/:username',(req,res)=>{
    const username = req.params.username;
    connection.query('SELECT * FROM borrowedbooks WHERE username=?',[username], (err,results)=>{
        if(err){
            console.log(err)
            res.status(500).send('Internal Server Error')
        }
        else res.json(results)
    })
  })

//   app.get('/most-borrowed',(req,res)=>{
//     const username = req.params.username;
//     connection.query('SELECT books.genre, COUNT(*) AS count
//     FROM borrowedbooks
//     INNER JOIN books ON borrowedbooks.bookId = books.id
//     GROUP BY books.genre
//     ORDER BY count DESC',[username], (err,results)=>{
//         if(err){
//             console.log(err)
//             res.status(500).send('Internal Server Error')
//         }
//         else res.json(results)
//     })
//   })

export default app;