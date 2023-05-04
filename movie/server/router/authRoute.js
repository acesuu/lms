import express from "express";
const app = express.Router();
import connection from "../db/connection.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


app.post('/register', (req, res) => {
  const { username, password, mobile, email, userType } = req.body;

  // Check for existing username
  const userQuery = `SELECT * FROM users WHERE username = '${username}'`;
  connection.query(userQuery, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send({ error: 'Unable to register user' });
    }
    if (results.length > 0) {
      return res.status(400).send({ error: 'Please use unique username' });
    }

    // Check for existing email
    const emailQuery = `SELECT * FROM users WHERE email = '${email}'`;
    connection.query(emailQuery, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ error: 'Unable to register user' });
      }
      if (results.length > 0) {
        return res.status(400).send({ error: 'Please use unique email' });
      }

      // Hash the password
      bcrypt.hash(password, 10, (error, hashedPassword) => {
        if (error) {
          console.error(error);
          return res.status(500).send({ error: 'Unable to register user' });
        }

        // Create the user object
        const newUser = {
          username,
          password: hashedPassword,
          mobile,
          email,
          userType
        };

        // Save the user to the database
        const userInsertQuery = 'INSERT INTO users SET ?';
        connection.query(userInsertQuery, newUser, (error, results) => {
          if (error) {
            console.error(error);
            return res.status(500).send({ error: 'Unable to register user' });
          }

          // Return success response
          res.status(201).send({ msg: 'User registered successfully' });
        });
      });
    });
  });
});


app.post('/login', async (req, res) => {
  const { username, password, userType } = req.body;

  try {
    // Find the user in the database
    const query = 'SELECT * FROM users WHERE username = ? AND userType = ?';
    connection.query(query, [username, userType], async (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ error: "Unable to login" });
      }
      const user = results[0];

      // If user not found, return error response
      if (!user) {
        return res.status(404).send({ error: "Username not found" });
      }

      // Check the password
      const passwordCheck = await bcrypt.compare(password, user.password);

      // If password doesn't match, return error response
      if (!passwordCheck) {
        return res.status(400).send({ error: "Password does not match" });
      }

      // Create a JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
        },
        // process.env.JWT_SECRET,
        "DSWHV3ukppdeq40Re0ARx3nAol7gWrofUqOdO/PtcUOVQ7IrQyXGhW0pYuCWqL+N",
        { expiresIn: "24h" }
      );

      // Return success response with token
      return res.status(200).send({
        msg: "Login successful",
        username: user.username,
        userType: user.userType,
        token,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Unable to login" });
  }
});

app.post('/logout', (req, res) => {
  // Clear the token from client-side storage
  localStorage.removeItem('token');

  // Redirect the user to the login page or send a success message
  res.status(200).send({ message: "Logout successful" });
});

app.get('/getUser/:username',(req,res)=>{
  const username = req.params.username;
    const sql = "SELECT * FROM users WHERE username = ?";
    connection.query(sql, [username], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error retrieving user from database");
        } else {
            res.send(result[0]);
        }
    });
})
export default app;



