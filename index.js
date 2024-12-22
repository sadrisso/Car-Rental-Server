const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();


//middlewares
app.use(express.json())
app.use(cors())






app.get("/", (req, res) => {
    res.send("Car Rental Service is Running...")
})

app.listen(port, () => {
    console.log(`Running on port --> ${port}`)
})