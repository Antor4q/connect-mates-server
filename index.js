const express = require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()
const port = process.env.PORT || 5000;

// 
// 

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i8hseoh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const assignmentsCollection = client.db("assignmentsDB").collection("assignments")
    const attemptedCollection = client.db("assignmentsDB").collection("attemptedAssign")

    // authentication api
    // app.post("/jwt",async(req,res)=>{
    //   const user = req.body
    //   const 
    // })

    // assignments api
    app.get("/createAssignment", async(req,res) => {
      const result = await assignmentsCollection.find().toArray()
      res.send(result)
    })

    app.get("/updateAssignment/:id", async(req,res) => {
      const id = req.params.id
      const query = { _id : new ObjectId(id)}
      const result = await assignmentsCollection.findOne(query)
      res.send(result)
    })

    app.post("/createAssignment", async(req,res) => {
        const query = req.body;
        const result = await assignmentsCollection.insertOne(query)
        res.send(result)
    })

    app.patch("/updateAssignment/:id", async(req,res) => {
      const id = req.params.id
      const query = { _id : new ObjectId(id)}
      const options = { upsert: true }
      const update = req.body
      const doc = {
        $set:{ 
          title : update.title,
          image : update.image,
          marks : update.marks,
          dueDate : update.dueDate,
          difficultyLevel : update.difficultyLevel,
          description : update.description
        }
      }
      const result = await assignmentsCollection.updateOne(query, doc, options)
      res.send(result)
    })

    app.delete("/createAssignment/:id", async(req,res) => {
      const id = req.params.id
      const query = { _id : new ObjectId(id)}
      const result = await assignmentsCollection.deleteOne(query)
      res.send(result)
    })

    // attempted assignments
    app.post("/attempted", async(req,res) => {
      const query = req.body;
      const result = await attemptedCollection.insertOne(query)
      res.send(result)
    })

    app.get("/pending", async(req,res) => {
      const result = await attemptedCollection.find().toArray()
      res.send(result)
    })

    app.get("/attempted/:email", async(req,res)=>{
      const cursor = req.params.email
      const result = await attemptedCollection.find({ email : cursor}).toArray()
      res.send(result)
    })

    app.put("/markAssign/:id", async(req,res)=> {
      const id = req.params.id
      const filter = {_id : new ObjectId(id)}
      const options = { upsert : true}
      const marked = req.body;
     
      const doc = {
        $set : {
          status : marked.status,
          giveMark : marked.giveMark,
          feedback : marked.feedback
        }
      }
      const result = await attemptedCollection.updateOne(filter, doc, options)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/",(req,res) => {
    res.send("Connect Mates is Running")
})

app.listen(port, ()=> {
    console.log(`Connect Mates is Running on Port : ${port}`)
})