import express from "express";
import dotenv from "dotenv";
import taskRouter from "./controllers/taskController.js";
import { connectDB } from "./config/db.js";

const app = express();
app.use(express.json());

dotenv.config();  //Read from.env

//Database Connection
connectDB();

//Register all routers
app.use("/task", taskRouter);

//Default endpoint
app.get("/", async (req, res)=>{
    res.json({code: 200, message: "Started..."});
});

const PORT = process.env.PORT || 8002;
//Listener
app.listen(PORT, async ()=>{
    console.log("Server running on http://localhost:" + PORT);
});