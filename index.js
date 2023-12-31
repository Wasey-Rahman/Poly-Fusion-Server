const express=require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const stripe = require('stripe')(process.env.PAYMENT_SECRET);
const cors=require('cors');
const jwt = require('jsonwebtoken');
const app=express();
const port =process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Jwt

const verifyJWT=(req,res,next)=>{
  const authorization=req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error:true,message:'unauthorized access'})
  }
  const token =authorization.split(' ')[1];

  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      return res.status(401).send({error:true,message:'unauthorized access'})
    }
    req.decoded=decoded;
    next();
  })
}







console.log(process.env.DB_PASS)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.awbfykh.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

// Popular Classes
const PopularClassesCollection = client.db('Poly-Fusion').collection('PopularClasses');
app.get('/PopularClasses',async(req,res)=>{
    const cursor = PopularClassesCollection.find();
    const result=await cursor.toArray();
    res.send(result);
})


// PopularInstructors
const PopularInstructorsCollection = client.db('Poly-Fusion').collection('PopularInstructors');
app.get('/PopularInstructors',async(req,res)=>{
    const cursor = PopularInstructorsCollection.find();
    const result=await cursor.toArray();
    res.send(result);
})




// Instructor
const InstructorCollection = client.db('Poly-Fusion').collection('Instructor');

app.get('/Instructor', async (req, res) => {
  const cursor = InstructorCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});


// Class
const ClassCollection = client.db('Poly-Fusion').collection('Class');

app.get('/Class', async (req, res) => {
  const cursor = ClassCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// Data
const SelectedDataCollection = client.db('Poly-Fusion').collection('Data');
app.post('/Data',async(req,res)=>{
const item=req.body;
console.log(item);
const result=await SelectedDataCollection.insertOne(item);
res.send(result);
})


app.get('/Data',verifyJWT,async(req,res)=>{
  const email=req.query.email;
  if(!email){
    res.send([]);
  }
  const decodedEmail=req.decoded.email;
  if(email !==decodedEmail){
    return res.status(403).send({error:true,message:'forbidden access'})

  }
 const query={email:email};
  const result=await SelectedDataCollection.find(query).toArray();
  res.send(result);
})

app.delete('/Data/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id:(id)};
  const result=await SelectedDataCollection.deleteOne(query);
  res.send(result);
  
})


// Payment
app.post('/create-payment-intent', async (req, res) => {
  const { price } = req.body;
  const amount=price*100;
  if (amount < 100) {
    // Handle the case when the amount is less than 1 unit
    res.status(400).send({ error: 'Invalid price' });
    return;
  }

  console.log(price,amount);
  try {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    
     
})
res.send({
  clientSecret: paymentIntent.client_secret,
});
} catch (error) {
  console.log('[Error]', error);
  res.status(500).send({ error: 'Failed to create payment intent' });
}

})



// jwt-token
app.post('/jwt',(req,res)=>{
  const user=req.body;
  const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
  res.send({token})
})










// user
const userCollection=client.db("Poly-Fusion").collection("user");
app.post('/user',async(req,res)=>{
  const user=req.body;
  console.log(user)
  const query={email:user.email}
  const existingUser=await userCollection.findOne(query);
  console.log(existingUser)
  if(existingUser){
    return res.send({message:'user already exists'})
  }
  const result=await userCollection.insertOne(user);
  res.send(result);
  })
  
  app.get('/user', async (req, res) => {
    const cursor = userCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  });

  


  app.get('/user/admin/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;
    if (req.decoded.email !== email) {
      res.send({ admin: false });
    }
  
    const query = { email: email };
    const user = await userCollection.findOne(query);
    const result = { admin: user?.role === 'admin' };
    res.send(result);
  });

  
  
  
  app.patch('/user/admin/:id', async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).send('Invalid ID'); // Return a response if ID is not provided
      }
  
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      };
  
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });








  app.patch('/user/instructor/:id', async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).send('Invalid ID'); // Return a response if ID is not provided
      }
  
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'instructor'
        }
      };
  
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


// Add_A_Class
  const Add_A_ClassCollection=client.db('Poly-Fusion').collection('Add_A_Class');


  app.get('/Add_A_Class', async (req, res) => {
    console.log(req.query.email);
    let query={};
    if(req.query?.email){
      query={ email: req.query.email}
      
    }
   
    const result= await Add_A_ClassCollection.find(query).toArray();
    res.send(result);
  })


  app.post('/Add_A_Class',async(req,res)=>{
      
    const add_A_class=req.body;
    console.log(add_A_class);
    const result=await Add_A_ClassCollection.insertOne(add_A_class);
    res.send(result);


    
});





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Poly-Fusion is running')
})

app.listen(port,()=>{
    console.log(`Poly-Fusion Server is running on port ${port}`)
}) 