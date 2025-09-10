import express from "express";
import cors from 'cors'
import { Route } from "./src/routes/User.route.js";
import leaveRoute from "./src/routes/Leave.route.js";
import { dbConnect } from "./src/Database/dbConnect.js";
import bodyParser from "body-parser";
import SidebarRouter from "./src/routes/Sidebar.route.js";
import { TeamRoute } from "./src/routes/Team.route.js";
import AttendanceRouter from "./src/routes/Attendance.router.js";
const app = express();

app.use(express.json());

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cors());

app.get("/home", (req, res) => {
  res.send("api is live");
});

// User related routes
app.use("/api", Route);

// leave related routes
app.use("/api/leave", leaveRoute);

// team related routes
app.use("/api/team", TeamRoute);

// sidebar related routes
app.use("/api/sidebar", SidebarRouter);

// attendance related routes
app.use("/api/attendance", AttendanceRouter);

app.listen(4343, async (err) => {
  if (err) return console.log("error while listning", err);
  dbConnect().then(() => {
    console.log(`server is running on 4343`);
  });
});
