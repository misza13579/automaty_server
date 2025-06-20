require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const resultsRoutes = require("./routes/results");

app.use(authRoutes);
app.use(userRoutes);
app.use(resultsRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});