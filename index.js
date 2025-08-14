import express from "express";
import cors from 'cors'
const app = express();

app.use(express.json())

app.use(cors())

app.get("/", (req, res) => {
  res.send("api is live");
  
});

app.listen(4343, (err) => {
  if (err) return console.log("error while listning");
  console.log("server is running");
});
