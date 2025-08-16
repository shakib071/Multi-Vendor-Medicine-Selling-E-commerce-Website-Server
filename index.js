const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config();
const cors = require('cors');
const port = 5000 
const admin = require("firebase-admin");


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
    const categoryCollection = client.db('medicineSellDB').collection('categories');
    const cartCollection = client.db('medicineSellDB').collection('cart');
    const SalerSoldCollection = client.db('medicineSellDB').collection('sold');
    const UserPurchasedCollection = client.db('medicineSellDB').collection('purchased');
    const buySaleIdCollection = client.db('medicineSellDB').collection('IdToTrackSaleandBuy');
    const advertiseemtCollection = client.db('medicineSellDB').collection('advertisement');

    app.get('/',(req,res)=> {
    res.send("Hello world from server");
    });

    //get saler added medicine 

    app.get('/saler-medicine/:uid', varifyFirebaseToken, async(req,res)=> {
      const uid = req.params.uid;

      if(req.decoded.uid != uid){
         return res.status(403).message({message: 'forbidden access'});
      }

      try{
        const query = {"saler.uid": uid}
        const salerMedicines = await medicinesCollection.find(query).toArray();
        res.send(salerMedicines);
      }
      catch{
        res.status(500).json({ message: 'Server error' });
      }
    });


    //get all users 

    app.get('/users/:uid', async(req,res)=> {
       const uid = req.params.uid;
       const user = await usersCollection.findOne({uid});
       if(!user || user.role != 'admin'){
        return res.status(401).send({message : 'unauthorized access'});
       }

      try {
        const users = await usersCollection.find({}).toArray();
        res.send(users);
      }
      catch(error){
        res.status(500).json({ message: 'Server error' });
      }
    });

    

    //get the categories 

    app.get('/get-category', async(req,res)=> {
      try{
        const categories = await categoryCollection.find({}).toArray();
        res.send(categories);
      }
      catch(error){
        res.status(500).json({ message: 'Server error' });
      }
    });

    // get all data 

    app.get('/all-medicines',async(req,res)=>{
      try{
        const allMedicines = await medicinesCollection.find({}).toArray();
        res.send(allMedicines);
      }
      catch(error){
        res.status(500).json({ message: 'Server error' });
      }
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


    //get medicine by category 

    app.get('/category-medicine/:category',async(req,res)=>{
      const category = req.params.category;
      const query = {category:category};
      const result = await medicinesCollection.find(query).toArray();
      res.send(result);
    });


    //get cart data for specific user 

    app.get('/cart-medicines/:userId', async(req,res)=>{
      const userId = req.params.userId;
      // console.log(userId);
    
      const query = {userId : userId}
      const result = await cartCollection.findOne(query);
      res.send(result);
    });


    //get user purchased data 

    app.get('/purchased-med/:userId',async(req,res)=> {
      const userId = req.params.userId;

      const query = {userId: userId};
      const result = await UserPurchasedCollection.findOne(query);
      res.send(result);
    });

    // get saler sold data 

    app.get('/sold-items/:userId', async(req,res)=> {
      const userId = req.params.userId;
      const query = {userId : userId};
      const result = await SalerSoldCollection.findOne(query);
      res.send(result);
    });

    app.get('/get-buy-sale-id',async(req,res)=> {
       const id= "689f93bcbdbb5098ab5b34ce";
       const query = {_id : new ObjectId(id)};
       const result = await buySaleIdCollection.updateOne(query ,{$inc: { idSB: 1 } });
       const result2= await buySaleIdCollection.findOne(query);
       res.send(result2);
    });

    // app.patch('/increment-buy-sale-id',async(req,res)=> {
    //   const id= "689f93bcbdbb5098ab5b34ce";
    //   const query = {_id : new ObjectId(id)};
    //   const result = await buySaleIdCollection.updateOne(query ,{$inc: { idSB: 1 } });
    //   res.send();
    // })


    //get all purchased medicines 

    app.get('/all-purchased-med',async(req,res)=> {
      const result = await UserPurchasedCollection.find({}).toArray();
      res.send(result);
    });

    //get all sold medicines 

    app.get('/all-sold-med',async(req,res) => {
      const result = await SalerSoldCollection.find({}).toArray();
      res.send(result);
    });


    //get user advertisement 

    app.get('/get-saler-ad/:userId',async(req,res)=> {
      const userId = req.params.userId;
      const query = {added_by : userId}
      const result = await advertiseemtCollection.find(query).toArray();
      res.send(result);

    });

    //get all advertisement 

    app.get('/get-all-advertisement', async(req,res)=> {
      const result = await advertiseemtCollection.find({}).toArray();
      res.send(result);
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
        const category = req.body.category;
         const categoryresult = await  categoryCollection.updateOne(
            {categoryName: category},
            {
              $inc: {noOfMedicine: 1}
            }
          );
          
        const result = await medicinesCollection.insertOne(medicinesData);
        res.send(result);
      }
      catch(error){
        res.status(500).send({message: 'server error'});
      }
    });


    //add category to database 

    app.post('/category', async(req,res) => {
     
      const categoryName = req.body.categoryName;
      const categoryImage = req.body.categoryImage;
       const categoryData = {
          categoryName,
          categoryImage,
          noOfMedicine: parseInt(0)
       }
      try{
        const ifCategoryExist = await categoryCollection.findOne({categoryName});
        if(ifCategoryExist){
          return res.status(200).send({message: 'Category Already exists'});
        }
        const result = await categoryCollection.insertOne(categoryData);
        res.send(result);
      }
      catch(error){
        res.status(500).send({message: 'server error'});
      }
    });


    //add cart for user to db

    app.post('/cart/:userId',async(req,res)=> {
      const userId = req.params.userId;
      const medicineData = req.body;

      if (!medicineData || !medicineData.name) {
        return res.status(400).send({ message: "Medicine data is invalid" });
      }

      try{
        const cart = await cartCollection.findOne({userId});
        
        if(cart){
          const existingItem = cart.medicines.find(item => item.name === medicineData.name);
          if(existingItem){
            return res.status(200).send({message: 'Items Already exists'});
          }
          const updatedCart = await cartCollection.findOneAndUpdate(
            {userId},
            {$push: {medicines: medicineData}},
            {new:true}
          )
          return res.send(updatedCart);
        }
        else{
          const newCart = await cartCollection.insertOne({
            userId,
            medicines: [medicineData],
            createdAt: new Date(),
            
          });

          return res.send(newCart);

        }
      }
      catch{
        return res.status(500).send({ message: "Internal Server Error" });
      }

    });


    //saler sold data 

    app.post('/saler-sold-items/:userId', async(req,res)=> {
      const userId = req.params.userId;
      const {soldItems}= req.body;

      try{
        const salerInfo = await SalerSoldCollection.findOne({userId});
        if(salerInfo){
          const salerSold = await SalerSoldCollection.findOneAndUpdate(
            {userId},
            {$push: {soldItems: soldItems}},
            {new:true}
          )

          res.send(salerSold);
        }
        else{
          const newSalerSold = await SalerSoldCollection.insertOne({
            userId,
            soldItems: [soldItems],
            createdAt: new Date(),
          });
          res.send(newSalerSold);
        }
      }
      catch(error){
        return res.status(500).send({ message: "Internal Server Error" });
      }
    })


    //user purchased medicines 

    app.post(`/user-purchased-items/:userId`,async(req,res)=> {
      const userId = req.params.userId;
      const {purchasedItem}= req.body;

        try{
          const userInfo = await UserPurchasedCollection.findOne({userId});
          if(userInfo){
            const userPurchased = await UserPurchasedCollection.findOneAndUpdate(
              {userId},
              {$push: {purchasedItem: purchasedItem}},
              {new:true}
            )

          res.send(userPurchased);
        }
        else{
          const newUserPurchased = await UserPurchasedCollection.insertOne({
            userId,
            purchasedItem: [purchasedItem],
            purchasedAt: new Date(),
          });
          res.send(newUserPurchased);
        }
      }
      catch(error){
        return res.status(500).send({ message: "Internal Server Error" });
      }
    });

    //stripe payment system 

    app.post('/create-chechout-session', async(req,res)=> {
      try{
        const {totalAmount} = req.body; //total in usd
        const amountInCents = Math.round(totalAmount * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          payment_method_types: ["card"],
          currency: 'usd',
          amount: amountInCents,
        });
        res.send({ clientSecret: paymentIntent.client_secret });
      }
      catch(error){
        res.status(500).send({error: error.message});
      }
    });

    //add advertisement to db 

    app.post('/add-advertisement',async(req,res)=> {
      const {advertisement} = req.body;
      const result = await advertiseemtCollection.insertOne(advertisement);
      res.send(result);
    });


    //update  advertisement status for slide 

    app.patch('/add-ad-to-slide/:id',async(req,res)=> {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const {Status} = req.body;
      try{
        const result = await advertiseemtCollection.updateOne(
          filter,
          {$set: {status : Status} }
        )
        res.send(result);
      }
      catch(error){
        res.status(500).send({error: 'Update Failed'});

      }
      
    });


    // update operation for change role 

    app.patch('/update-role/:id',async(req,res)=> {
      const id = req.params.id;
      const newRole = req.body;
      try{
        const filter = {_id : new ObjectId(id)};
        const updatedRole = {$set : newRole};
        const result = await usersCollection.updateOne(filter,updatedRole);
        res.send(result);
      }
      catch(error){
        res.status(500).send({error: 'Update Failed'});

      }
    });

    //update Category 

    app.patch('/update-category/:id',async(req,res)=> {
      const id = req.params.id;
      const {categoryName,categoryImage} = req.body;

      try{
        if(categoryImage){
          const result = await  categoryCollection.updateOne(
            {_id: new ObjectId(id)},
            {
              $set: {
                categoryName: categoryName,
                categoryImage : categoryImage,
                
              }
            }
          );
          res.send(result);
        }
        else{
          const result = await  categoryCollection.updateOne(
            {_id: new ObjectId(id)},
            {
              $set: {
                categoryName: categoryName
                
              }
            }
          );
          res.send(result);
        }
      }
      catch(error){
        res.status(500).send({error: 'Update Failed'});
      }
    });

    //increment and decrement of quantity 

    app.patch('/incOrDec-cat-quantity/:id',async(req,res)=> {
      const id = req.params.id;
      const {name,increment} = req.body;
      
      if(increment){
        const result = await cartCollection.updateOne(
        {
          userId: id,
          "medicines.name": name,
        },
        {
          $inc: {"medicines.$.quantity": 1}
        }
        )
        res.send(result);
      }
      else{
        const result = await cartCollection.updateOne(
        {
          userId: id,
          "medicines.name": name,
        },
        {
          $inc: {"medicines.$.quantity": -1}
        }
        )
        res.send(result);
      }

      
    });

    

    //update paid status of saler and buyer 

    app.patch('/update-paid-status/:sbId',async(req,res)=> {
     try{
         const sbId = parseInt(req.params.sbId);
         if (isNaN(sbId)) {
          return res.status(400).send({ error: "Invalid sbId" });
          }

        const result = await UserPurchasedCollection.updateOne(
          {"purchasedItem.sbId" : sbId},
          {$set: {"purchasedItem.$.paid_status" : "paid"}},
        );
        const result2 = await SalerSoldCollection.updateOne(
          {"soldItems.sbId" : sbId},
          {$set: {"soldItems.$.paid_status" : "paid"}},
        )
        res.send({result,result2});
      }
      catch(error){
        res.status(500).send({ 
          error: "Internal server error",
          details: error.message 
          });
      }
    });


    //delete a catagory 

    app.delete('/delete-category/:id',async(req,res)=> {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await categoryCollection.deleteOne(query);
      res.send(result);
    });


    //delet  the entire user cart


    app.delete('/delete-cart/:userId',async(req,res)=> {
      const userId = req.params.userId;
      const query = {userId: userId};
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

    // delete a single cart item 

    app.delete('/delete-cart-item/:userId/med/:medicineName',async(req,res)=> {
      try{
        const { userId, medicineName } = req.params;

        const result = await  cartCollection.updateOne(
          {userId},
          { $pull: { medicines: { name: medicineName } } }
        );
        res.send(result);
      }
      catch(error){
        return res.status(500).send({ message: "Internal Server Error" });
      }
    })


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


