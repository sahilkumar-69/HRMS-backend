import express from "express";
import cors from 'cors'
import { Route } from "./src/routes/User.route.js";
import DashBoardRoute from "./src/routes/dashBoard.js";
import { dbConnect } from "./src/Database/dbConnect.js";
import bodyParser from "body-parser";
const app = express();

app.use(express.json());

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cors());

app.get("/home", (req, res) => {
  res.send("api is live");
});

app.use("/", Route);
app.use("/dashboard", DashBoardRoute);

app.listen(4343, async (err) => {
  if (err) return console.log("error while listning");
  dbConnect().then(() => {
    console.log(`server is running on 4343`);
  });
});
