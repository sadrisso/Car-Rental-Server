const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();


//middlewares
app.use(express.json())
// app.use(cookieParser())
app.use(cors())
// app.use(cors({
//     origin: ['http://localhost:5173'],
// }))



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.oq68b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const carsCollection = client.db("carsDB").collection("cars");
        const bookingCollection = client.db("carsDB").collection("bookings")



        //POST APIS STARTS FROM HERE
        app.post("/add-car", async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car);
            res.send(result)
        })


        app.post("/my-bookings", async (req, res) => {
            const data = req.body;
            const IncData = { $inc: { bookingCount: 1 } }
            const query = {carModel: data?.carModel}
            const result = await bookingCollection.insertOne(data)

            await carsCollection.updateOne(query, IncData)
            res.send(result)
        })


        // app.post("/jwt", async (req, res) => {
        //     const user = req.body;
        //     const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '5hr' })

        //     res.cookie("token", token, { httpOnly: true, secure: false })
        //         .send({ success: true })
        // })
        //POST APIS ENDS HERE




        //GET APIS STARTS FROM HERE
        app.get("/my-cars/:email", async (req, res) => {
            const email = req.params.email;
            const sortByPrice = req.query.price;
            const sortByDate = req.query.date;

            console.log("Cokkie --", req.cookies)

            const query = { userEmail: email }

            let sort = {};

            if (sortByPrice) {
                sort = { ...sort, dailyRentalPrice: -1 }
            }

            if (sortByDate) {
                sort = { ...sort, date: -1 }
            }

            let result;


            if (sort) {
                result = await carsCollection.find(query).sort(sort).toArray();
            }
            else {
                result = await carsCollection.find(query).toArray();
            }
            res.send(result);
        })


        app.get("/my-bookings/:email", async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email }


            const sortByDate = req.query.date;
            const sortByPrice = req.query.price;

            let sort = {}

            if (sortByDate) {
                sort = { ...sort, date: -1 }
            }

            if (sortByPrice) {
                sort = { ...sort, dailyRentalPrice: -1 }
            }

            let result;

            if (sort) {
                result = await bookingCollection.find(query).sort(sort).toArray()
            }
            else {
                result = await bookingCollection.find(query).toArray()
            }
            res.send(result)
        })


        app.get("/all-cars", async (req, res) => {
            const searchName = req.query.searchName;
            const sortByPrice = req.query.price;
            const sortByDate = req.query.date;

            let sort = {};
            let query = {};

            if (searchName) {
                query = { carModel: { $regex: new RegExp(searchName, 'i') } };
            }

            if (sortByPrice) {
                sort = { ...sort, dailyRentalPrice: -1 }
            }

            if (sortByDate) {
                sort = { ...sort, date: -1 }
            }

            let result;

            if (sort) {
                result = await carsCollection.find(query).sort(sort).toArray();
            }
            else {
                result = await carsCollection.find(query).toArray();
            }
            res.send(result);
        });


        app.get("/recent-listed", async (req, res) => {
            const result = await carsCollection.find().sort({ date: -1 }).limit(6).toArray()
            res.send(result)
        })


        app.get("/is-car-booked/:email/:model", async (req, res) => {
            const email = req.params.email;
            const model = req.params.model;
            const query = { userEmail: email, carModel: model }
            const result = await bookingCollection.findOne(query)
            res.send(result || false)
        })


        app.get("/update-car/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.findOne(query);
            res.send(result)
        })


        app.get("/car-details/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.findOne(query);
            res.send(result)
        })
        //GET APIS ENDS HERE




        //PUT API STARTS FROM HERE
        app.put("/update-car/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    carModel: data.carModel,
                    dailyRentalPrice: data.dailyRentalPrice,
                    availability: data.availability,
                    registrationNumber: data.registrationNumber,
                    location: data.location,
                    features: data.features,
                    description: data.description
                }
            }

            const result = await carsCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })

        app.put("/update-booking/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const query = { _id: new ObjectId(id) }


            const updateDoc = {
                $set: {
                    ...data
                }
            }

            const result = await bookingCollection.updateOne(query, updateDoc)
            res.send(result)
        })
        //PUT API ENDS HERE



        //DELETE APIS STARTS FROM HERE
        app.delete("/my-cars/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.deleteOne(query);
            res.send(result)
        })
        //DELETE APIS ENDS HERE




        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get("/", (req, res) => {
    res.send("Car Rental Service is Running...")
})

app.listen(port, () => {
    console.log(`Running on port --> ${port}`)
})