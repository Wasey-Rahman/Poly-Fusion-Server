const express=require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const cors=require('cors');
const app=express();
const port =process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

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
    await client.connect();


const PopularClassesCollection = client.db('Poly-Fusion').collection('PopularClasses');
app.get('/PopularClasses',async(req,res)=>{
    const cursor = PopularClassesCollection.find();
    const result=await cursor.toArray();
    res.send(result);
})



const PopularInstructorsCollection = client.db('Poly-Fusion').collection('PopularInstructors');
app.get('/PopularInstructors',async(req,res)=>{
    const cursor = PopularInstructorsCollection.find();
    const result=await cursor.toArray();
    res.send(result);
})





const InstructorCollection = client.db('Poly-Fusion').collection('Instructor');

app.get('/Instructor', async (req, res) => {
  const cursor = InstructorCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});



const ClassCollection = client.db('Poly-Fusion').collection('Class');

app.get('/Class', async (req, res) => {
  const cursor = ClassCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});


const SelectedDataCollection = client.db('Poly-Fusion').collection('Data');
app.post('/Data',async(req,res)=>{
const item=req.body;
console.log(item);
const result=await SelectedDataCollection.insertOne(item);
res.send(result);
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


app.get('/',(req,res)=>{
    res.send('Poly-Fusion is running')
})

app.listen(port,()=>{
    console.log(`Poly-Fusion Server is running on port ${port}`)
})