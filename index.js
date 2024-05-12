const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const cors = require("cors")
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())





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
    const featuredRoomsCollection = client.db('Roomify').collection('featuredRooms')
    const bookedRoomsCollection = client.db('Roomify').collection('bookedRooms')
    const userReviewsCollection = client.db('Roomify').collection('usersReview')

    // getting all rooms from mongoDB
    app.get('/rooms', async(req, res) =>{
      const cursor = roomsCollection.find()
      const results = await cursor.toArray()
      res.send(results)
    })

    // posting booked rooms
    app.post('/bookings', async(req, res) =>{
      const bookingRoom = req.body
      const result = await bookedRoomsCollection.insertOne(bookingRoom)
      res.send(result)
    })

    // getting all booking rooms in the server side
    app.get('/bookings', async (req, res) => {
      // console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await bookedRoomsCollection.find(query).toArray();
      res.send(result);
  })

  // delete a booked room
  app.delete('/bookings/:id', async(req, res) =>{
    const id = req.params.id
    const result = await bookedRoomsCollection.deleteOne({_id: new ObjectId(id)})
    res.send(result)
  })

  // app.get('/bookings/:id', async(req, res) =>{
  //   const id = req.params.id;
  //   const query = {_id : new ObjectId(id)}
  //   const result = await bookedRoomsCollection.findOne(query)
  //   res.send(result)
  // })
  
  // update the date of the booked room
  app.patch('/bookings/:id', async(req, res) =>{
    const id = req.params.id;
    const filter = {_id : new ObjectId(id)}
    // console.log(id)
    const updateBookingRoom = req.body;
    const bookedRoom = {
      $set: {
        bookedRoomDate : updateBookingRoom.bookedRoomDate
      }
    }
    const result = await bookedRoomsCollection.updateOne(filter, bookedRoom)
    res.send(result)
  })

// sending userReviews to server
    app.post('/usersreview', async(req, res)  =>{
      const review = req.body;
      const result = await userReviewsCollection.insertOne(review)
      res.send(result)
    })

 // getting all rooms from mongoDB
//  app.get('/featuredrooms', async(req, res) =>{
//   const cursor = featuredRoomsCollection.find()
//   const results = await cursor.toArray()
//   res.send(results)
// })


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