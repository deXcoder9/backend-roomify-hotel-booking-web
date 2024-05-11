const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const cors = require("cors")
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())



console.log(process.env.DB_user, process.env.DB_pass)


const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.wvuyzyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const roomsCollection = client.db('Roomify').collection('rooms')

    // getting all rooms from mongoDB
    app.get('/rooms', async(req, res) =>{
      const cursor = roomsCollection.find()
      const results = await cursor.toArray()
      res.send(results)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {

  }
}
run().catch(console.dir);




app.get('/', (req, res) =>{
    res.send("roomify server is running.....")
})
app.listen(port, ()=>{
    console.log(`Roomify server is running on port ${port}`)
})