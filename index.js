const { MongoClient } = require('mongodb');
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

        app.get('/drones',async(req,res)=>{
            const size=parseInt(req.query.size);
            const page =req.query.page;
            const cursor = drones_Collection.find({});
            const count= await cursor.count();
            const drones = await cursor.skip(size*page).limit(size).toArray();
            res.json({count,drones});
        })
        
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);















app.listen(port, () => {
    console.log('server is running on port', port);
})