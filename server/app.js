import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"
import expenseRoutes from "./routes/expenseRoute.js"
import budgetRoutes from "./routes/budgetRoute.js"
import notificationsRoutes from "./routes/notificationRoutes.js"
import bodyParser from "body-parser";
import cors from "cors";
dotenv.config();

connectDB();

const app = express();
app.use(bodyParser.json())
app.use(cors())

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/budget' , budgetRoutes);
app.use('/api/notifications' , notificationsRoutes)

app.get("/", (req, res) => {
  res.send("FinSight API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});