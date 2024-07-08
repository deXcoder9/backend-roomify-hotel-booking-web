const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const cors = require("cors")
var cookieParser = require('cookie-parser')
var jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


// middleware
app.use(cors({
  origin: [
      'http://localhost:5173',
      'https://roomify-dexcoder.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())





const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.wvuyzyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middlewares
const logger = (req, res, next) =>{
  console.log('log: info', req.method, req.url);
  next();
}
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.accessToken;
  if(!token){
      return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token,  process.env.ACCESS__Token , function(err, decoded) {
      if(err){
          return res.send({mesage: 'unauthorizwed access'}).status(401)
      }
      req.user = decoded;
      next();
    });
}
const cookiesSettings = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const roomsCollection = client.db('Roomify').collection('rooms')
    const featuredRoomsCollection = client.db('Roomify').collection('featuredRooms')
    const bookedRoomsCollection = client.db('Roomify').collection('bookedRooms')
    const userReviewsCollection = client.db('Roomify').collection('usersReview')


     // auth related api
     app.post('/jwt', async(req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS__Token , {expiresIn: '1h'})
      res
      .cookie('accessToken', token, cookiesSettings)
      .send({status: 'success'})

  })
  app.post('/logout', async(req, res) => {
      const user = req.body;
      console.log('logging out user:-' , user)
      res
      .clearCookie('accessToken', { ...cookiesSettings, maxAge : 0} )
      .send({status: 'success'})
      

})



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


// updating booked room's availability
    app.patch('/rooms/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updateRoom = req.body;
      console.log(updateRoom)
      const room = {
        $set: {
          availability : updateRoom.availability
        }
      }
      const result = await roomsCollection.updateOne(filter, room)
      res.send(result)
    })



// sending userReviews to server
    app.post('/usersreview', async(req, res)  =>{
      const review = req.body;
      const result = await userReviewsCollection.insertOne(review)
      res.send(result)
    })
// getting all users review form mongoDb
    app.get('/usersreview', async(req, res) =>{
      const cursor = userReviewsCollection.find()
      const results = await cursor.toArray()
      res.send(results)
    })

//  getting all rooms from mongoDB
 app.get('/featuredrooms', async(req, res) =>{
  const cursor = featuredRoomsCollection.find()
  const results = await cursor.toArray()
  res.send(results)
})


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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