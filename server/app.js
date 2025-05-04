require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Importy tras
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const resultsRoutes = require("./routes/results");

// Trasy
app.use(authRoutes);
app.use(userRoutes);
app.use(resultsRoutes);

app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
