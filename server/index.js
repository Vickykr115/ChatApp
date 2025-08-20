const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./Routes/user.routes");
const chatRoutes = require("./Routes/chatroute");
const messageRoutes = require("./Routes/messageRoute");

const app = express();

app.use(express.json());
app.use(cors());
require("dotenv").config();

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.listen(port, (req, res) => {
    console.log(`Server running on ${port}`)
})

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Mongo Db connected successfuly")).catch((error) => console.log("connection failed", error.message));

