const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const app = express();
const cors = require('cors');
const { application } = require('express');
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

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);















app.listen(port, () => {
    console.log('server is running on port', port);
})