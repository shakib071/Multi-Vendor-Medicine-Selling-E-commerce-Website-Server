const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
require('dotenv').config();
const cors = require('cors');
const port = 5000 
const admin = require("firebase-admin");


const decoded = Buffer.from(process.env.FIREBASE_SERVICE_KEY,'base64').toString('utf-8');
const serviceAccount = JSON.parse(decoded);

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


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const varifyFirebaseToken = async(req,res,next) => {
  const authHeader = req.headers?.authorization;

  if(!authHeader || !authHeader.startsWith(`Bearer `)){
    return res.status(401).send({message : 'unauthorized access'});
  }

  const token = authHeader.split(' ')[1];
  try{
    const decoded = await admin.auth().verifyIdToken(token);
    req.decoded = decoded;
    // console.log(decoded);
  }
  catch(error){
    return res.status(401).send({message : 'unauthorized access'});
  }
  // console.log(token);
  next();
}




async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db('medicineSellDB').collection('users');
    const medicinesCollection = client.db('medicineSellDB').collection('medicines');

    app.get('/',(req,res)=> {
    res.send("Hello world from server");
    });

    //get user role
    
    app.get('/users-role/:uid', async(req,res)=> {
      const uid = req.params.uid;

      try{
        const user = await usersCollection.findOne({uid});
        if(!user){
          return res.status(404).json({ message: 'User not found' });
        }
        res.send({role: user.role});
      }
      catch(error){
        res.status(500).json({ message: 'Server error' });
      }

    });


    //save user

    app.post('/users',async(req,res)=> {
        const {username,email,role,photoURL,uid} = req.body;

        try{
            const existingUser = await usersCollection.findOne({email});

            if(existingUser){
                return res.status(200).send({message: 'User Already exists'});
            }
            const newUser = {
                uid,
                email,
                username,
                role,
                photoURL,
                createdAt: new Date(),
                
            };

            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        }
        catch(error) {
            res.status(500).send({message: 'server error'});
        }
    });

    //add saler added saler medicine to database 

    app.post('/medicines', async(req,res)=> {
      const medicinesData = req.body;
      const name = req.body.name;
      try{
        const existingMedicine = await medicinesCollection.findOne({name});
        // console.log(medicinesData,name,existingMedicine);
        if(existingMedicine){
          return res.status(200).send({message: 'Medicine Already exists'});
        }
        const result = await medicinesCollection.insertOne(medicinesData);
        res.send(result);
      }
      catch(error){
        res.status(500).send({message: 'server error'});
      }
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


