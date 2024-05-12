const express= require('express');
const cors=require('cors');
const app=express();
const port= process.env.PORT || 5000;
require('dotenv').config()

//middlewares
app.use(cors());
app.use(express.json());
    

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g0tttxr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Write your codes
    const allCollection=client.db('groupAssignment').collection('all');
    const submitCollection=client.db('groupAssignment').collection('submit');

    app.get('/all',async(req,res)=>{
        const cursor= await allCollection.find();
        const result= await cursor.toArray();
        res.send(result);
    })
    app.get('/submit',async(req,res)=>{
        const cursor= await submitCollection.find();
        const result= await cursor.toArray();
        res.send(result);
    })

    app.get('/submit/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result= await submitCollection.findOne(query);
      res.send(result);
    })

    app.get('/all/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result= await allCollection.findOne(query);
      res.send(result);
    })

    app.post('/all',async(req,res)=>{
        const body= req.body;
        const result= await allCollection.insertOne(body);
        res.send(result);
    })

    
    
    

    app.post('/submit',  async (req, res) => {
      const body = req.body;
      const {
          title,
          submittedBy,
          creatorEmail,
          thumbnailUrl,
          marks,
          difficultyLevel,
          description,
          deadline,
          link,
          note,
          submitEmail
      } = req.body;
  
      try {
          
          const result = await submitCollection.insertOne({
              
              link:link,
              note:note,
              submittedBy: submittedBy,
              submitEmail:submitEmail,
              sStatus: "pending",
              title: title,
              creatorEmail: creatorEmail,
              thumbnailUrl: thumbnailUrl,
              marks: marks,
              difficultyLevel: difficultyLevel,
              description: description,
              deadline: deadline
          });
          res.send({ status: "ok" });
      } catch (error) {
          console.error("Error storing document:", error);
          res.status(500).send("Internal Server Error");
      }
  });

  app.put('/submit/:id', async (req, res) => {
    const id = req.params.id;
    const { result: marksResult, feedback:feedback } = req.body;

    try {
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
                sStatus: "complete",
                feedback: feedback,
                result: parseInt(marksResult), // Ensure result is parsed to integer
            }
        };

        const updateResult = await submitCollection.updateOne(filter, updateDoc);
        res.send(updateResult);
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});






  
    

  

    app.put('/all/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
    
  
      try {
          const filter = { _id: new ObjectId(id) }
          const options={ upsert:true }
          const updateDoc = {
             $set:{
              title: updatedProduct.title,
              email: updatedProduct.email,
              thumbnailUrl: updatedProduct.thumbnailUrl,
              marks: updatedProduct.marks,
              difficultyLevel: updatedProduct.difficultyLevel,
              description: updatedProduct.description,
              IsSubmitted: updatedProduct.IsSubmitted
             }
          }
  
          const result = await allCollection.updateOne(filter, updateDoc,options);
          res.send(result);
        
      } catch (error) {
          console.error('Error updating product:', error);
          res.status(500).send({ error: 'Internal Server Error' });
      }
      
  });

  app.delete('/all/:id',async(req,res)=>{
    const id = req.params.id;
    try{
      const filter = { _id: new ObjectId(id) }
      const result=allCollection.deleteOne(filter);
      res.send(result);
         
    }
    catch(error){}
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
    res.send("Group Assignment is running");
})

app.listen(port,(req,res)=>{
    console.log(`The server is running on port ${port}`);
})