const express = require("express");
const cors = require("cors");
// DB_USER=Music-Toy
// DB-PASS=N8AiL2FoH5QGPaIF
const app = express();
app.use(cors());
app.use(express.json());
//${process.env.DB_USER}:${process.env.DB_PASS}
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri=`mongodb://Music-Toy:N8AiL2FoH5QGPaIF@ac-55gaz78-shard-00-00.ssocgpa.mongodb.net:27017,ac-55gaz78-shard-00-01.ssocgpa.mongodb.net:27017,ac-55gaz78-shard-00-02.ssocgpa.mongodb.net:27017/?ssl=true&replicaSet=atlas-12dfcw-shard-0&authSource=admin&retryWrites=true&w=majority`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
   
    const db = client.db("Music-Toy");
    const ToysCollection = db.collection("Toy");
    // Creating index on two fields
    const indexKeys = { title: 1, category: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "titleCategory" }; // Replace index_name with the desired index name
    const result = await ToysCollection.createIndex(indexKeys, indexOptions);
    console.log(result);
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    app.get("/allToys", async (req, res) => {
      const Toys = await ToysCollection
        .find({})
        .sort({ price: -1 })
        .toArray();
      res.send(Toys);
    });
    app.get("/singleToy/:id", async (req, res) => {
      console.log(req.params.id);
      const Toys = await ToysCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(Toys);
    });


    
    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.id);
      const Toys = await ToysCollection
        .find({
          postedBy: req.params.email,
        })
        .toArray();
      res.send(Toys);
    });

    app.get("/allToysByCategory/:category", async (req, res) => {
      console.log(req.params.id);
      const Toys = await ToysCollection
        .find({
          status: req.params.category,
        })
        .toArray();
      res.send(Toys);
    });

    app.post("/post-Toy", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      console.log(body);
      const result = await ToysCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    app.get("/getToysByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await ToysCollection
        .find({
          $or: [
            { title: { $regex: text, $options: "i" } },
            { category: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });
   
    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title: body.title,
          price: body.price,
          description: body.description,
          quantity:body.quantity,
         
        },
      };
      const result = await ToysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.delete("/deleteToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await ToysCollection.deleteOne(filter);
      if (result.deletedCount === 1) {
        res.send({ message: "Toy deleted successfully" });
      } else {
        res.status(404).send({ message: "Toy not found" });
      }
    });
    
    app.get("/singleToy/:id", async (req, res) => {
      try {
        console.log(req.params.id);
        const toy = await ToysCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(toy));
      } catch (error) {
        console.log("Error fetching toy details:", error);
        res.status(500).json({ error: "Failed to fetch toy details" });
      }
    });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(5000, () => {
  console.log("server is running on port 5000");
});
