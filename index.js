import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// middlewares
app.use(cors());

const port = process.env.PORT || 500;

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
