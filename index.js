import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Route } from "./src/routes/User.route.js";
import leaveRoute from "./src/routes/Leave.route.js";
import { dbConnect } from "./src/Database/dbConnect.js";
import bodyParser from "body-parser";
import SidebarRouter from "./src/routes/Sidebar.route.js";
import { TeamRoute } from "./src/routes/Team.route.js";
import AttendanceRouter from "./src/routes/Attendance.router.js";
import dailyUpdateRoutes from "./src/routes/dailyTaskUpdate.router..js";
import { TaskRoutes } from "./src/routes/Task.route.js";
import administrationRoutes from "./src/routes/administration.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import { policyRoutes } from "./src/routes/policy.routes.js";
import { initiateServer } from "./src/utils/socketIO.js";
import { salesRouter } from "./src/routes/sales.routes.js";
import otpRouter from "./src/routes/otp.routes.js";
import path from "path";

const app = express();

// const server = createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3001",
];

// initiateServer(server);

app.set("view engine", "ejs");

app.set("views", path.join(path.resolve(), "/src/views"));

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

// administration related routes
app.use("/api/administration", administrationRoutes);

// task related routes
app.use("/api/task", TaskRoutes);

//notification related routes
app.use("/api/notification", notificationRoutes);

// daily task update related routes
app.use("/api/daily-updates", dailyUpdateRoutes);

// sidebar related routes
app.use("/api/sidebar", SidebarRouter);

// attendance related routes
app.use("/api/attendance", AttendanceRouter);

// admin related routes
app.use("/api/admin", adminRoutes);

// policy related routes
app.use("/api/policy", policyRoutes);

// sales related routes
app.use("/api/sales", salesRouter);

app.use("/api/reset-password", otpRouter);


app.listen(4343, async (err) => {
  if (err) return console.log("error while listning", err);
  dbConnect().then(() => {
    console.log(`server is running on 4343`);
  });
});
