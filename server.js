const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mySqlPool = require("./config/db");

//configure dotenv
dotenv.config();

const app = express();

//middlewares
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use('/api/v1/student', require('./routes/studentRoutes'));

app.get("/test", (req, res) => {
  res.status(200).send("<h1>Node js Mysql</h1>");
});

//port
const PORT = process.env.PORT || 8000;

//listen
mySqlPool
  .query("SELECT 1")
  .then(() => {
    //MYSQL
    console.log("Database connection established.");
    //listen
    app.listen(PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
