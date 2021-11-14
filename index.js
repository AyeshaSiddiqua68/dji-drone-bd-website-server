const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('DJI drone is running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ksgka.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("DJI-Drone-BD");
        const drones_Collection = database.collection("drones");
        const cart_Collection = database.collection("cart");


        //load drones (GET API)
        app.get("/drones", async (req, res) => {
            const size = parseInt(req.query.size);
            const page = req.query.page;
            const cursor = drones_Collection.find({});
            const count = await cursor.count();

            let drones;
            if (size && page) {
                drones = await cursor.skip(size * page).limit(size).toArray();
            }
            else {
                drones = await cursor.toArray();
            }

            res.json({ count, drones });
        });

        //load single drone drone (GET API)
        app.get("/drones/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const drone = await drones_Collection.findOne(query);
            res.json(drone);
        });

        //load cart information by uid (GET API)
        app.get("/cart/:uid", async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await cart_Collection.find(query).toArray();
            res.json(result);
        });


        //add data and extra info to cart
        app.post("/drone/add", async (req, res) => {
            const drone = req.body;
            const result = await cart_Collection.insertOne(drone);
            res.json(result)
        });

        //delete data from cart (DELETE API)
        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cart_Collection.deleteOne(query);
            res.json(result);
        });

        //for purchase button (DELETE API)
        app.delete("/purchase/:uid", async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await cart_Collection.deleteMany(query);
            res.json(result);

        })






    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);















app.listen(port, () => {
    console.log('server is running on port', port);
})