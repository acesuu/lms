import bookRoute from './router/bookRoute.js'
import authRoute from './router/authRoute.js'
import borrowRoute from './router/borrowRoute.js'
import recommendationRoute from './router/recommendationRoute.js'
import reportRoute from './router/reportRoute.js'
import connection from './db/connection.js'
import cors from 'cors'
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import path from "path";
import sendOverdueBookNotifications from './router/notificationRoute.js'
dotenv.config({ path: path.resolve("./.env") });

import express from "express";
const app = express();

// sendOverdueBookNotifications();





connection.getConnection(function(err){
  if(err)throw err;
  console.log("connected....")
}
)

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({origin: true, credentials: true}));

app.use("/",bookRoute);
app.use("/auth",authRoute);
app.use("/borrow",borrowRoute);
app.use("/recommendation",recommendationRoute);
app.use("/report",reportRoute);

app.listen(3001,()=>{
    console.log("server running on port 3001");
})