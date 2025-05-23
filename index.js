const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@crewup.2xkcsfw.mongodb.net/?retryWrites=true&w=majority&appName=crewup`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const groupCollection = client.db("groupDB").collection("groups");

    app.get("/groups", async (req, res) => {
      const query = groupCollection.find();
      const result = await query.toArray();
      res.send(result);
    });
    // Only Active Group and Only 6
    app.get("/groups/featured", async (req, res) => {
      const now = new Date();
      const allGroups = await groupCollection.find().toArray();
      const activeGroups = allGroups.filter((group) => {
        const startDateTime = new Date(`${group.startDate}T${group.time}`);
        return startDateTime > now;
      });
      res.send(activeGroups.slice(0, 6));
    });

    app.get("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await groupCollection.findOne(query);
      res.send(result);
    });
    app.post("/groups", async (req, res) => {
      const newGroup = req.body;
      const result = await groupCollection.insertOne(newGroup);
      res.send(result);
    });
    app.patch("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedGroup = req.body;
      const updatedDoc = {
        $set: updatedGroup,
      };
      const result = await groupCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    app.delete("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await groupCollection.deleteOne(query);
      res.send(result);
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

app.get("/", (req, res) => {
  res.send("Hello World! This is Crewup Server.");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
run().catch(console.dir);
