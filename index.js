const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();


//middlewares
app.use(express.json())
app.use(cors())



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
        await client.connect();

        const carsCollection = client.db("carsDB").collection("cars");




        //POST APIS STARTS FROM HERE
        app.post("/add-car", async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car);
            res.send(result)
        })
        //POST APIS ENDS HERE




        //GET APIS STARTS FROM HERE
        app.get("/my-cars/:email", async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email }
            const result = await carsCollection.find(query).toArray()
            res.send(result)
        })


        app.get("/update-car/:id", async (req, res) => {
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
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
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