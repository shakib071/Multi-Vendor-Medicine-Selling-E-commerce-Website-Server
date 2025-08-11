const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
require('dotenv').config();
const cors = require('cors');
const port = 5000 


//middleware 
app.use(cors());
app.use(express.json());


const { DB_USER , DB_PASS } = process.env;

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@recipie-book-app.ifzwuw8.mongodb.net/?retryWrites=true&w=majority&appName=Recipie-Book-App`;


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


    app.get('/',(req,res)=> {
    res.send("Hello world from server");
    });










    app.listen(port,() => {
        console.log(`Example app listening on port ${port}`);
    });



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);


