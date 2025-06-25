const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// MiddleWare
app.use(cors());
app.use(express.json());

const uri = `${process.env.MONGODB_URI}`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const groupCollection = client.db("groupDB").collection("groups");
    const userCollection = client.db("userDB").collection("user");
    // Create and update user info
    app.post("/users", async (req, res) => {
      const newUserData = req.body;

      if (!newUserData.email) {
        return res.status(400).send({ error: "Email is required" });
      }

      try {
        const existingUser = await userCollection.findOne({
          email: newUserData.email,
        });

        if (existingUser) {
          // Update existing user
          await userCollection.updateOne(
            { email: newUserData.email },
            {
              $set: {
                displayName:
                  newUserData.displayName || existingUser.displayName,
                photoURL: newUserData.photoURL || existingUser.photoURL,
                updatedAt: new Date(),
              },
            }
          );
          return res.send({ message: "User updated successfully" });
        }

        // Insert new user
        newUserData.createdAt = new Date();
        await userCollection.insertOne(newUserData);

        res.send({ message: "User created successfully" });
      } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // Group API
    // Get all Group
    app.get("/groups", async (req, res) => {
      try {
        const query = groupCollection.find().sort({ _id: -1 });
        const result = await query.toArray();
        res.send(result);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // Only Active Group and Only 6
    app.get("/groups/featured", async (req, res) => {
      const now = new Date();
      const allGroups = await groupCollection
        .find()
        .sort({ _id: -1 })
        .toArray();
      const activeGroups = allGroups.filter((group) => {
        const startDateTime = new Date(`${group.startDate}T${group.time}`);
        return startDateTime > now;
      });
      res.send(activeGroups.slice(0, 6));
    });

    app.get("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const reqEmail = req.query.email;
      const query = { _id: new ObjectId(id) };
      const result = await groupCollection.findOne(query);
      result.book = true;
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
    //Booking Process
    app.post("/bookings", async (req, res) => {
      const { groupId, userEmail } = req.body;

      if (!groupId || !userEmail) {
        return res.status(400).json({ error: "Missing groupId or userEmail." });
      }

      try {
        const groupObjectId = new ObjectId(groupId);
        const group = await groupCollection.findOne({ _id: groupObjectId });

        if (!group) {
          return res.status(404).json({ error: "Group not found." });
        }

        const alreadyBooked = group.bookings?.some(
          (booking) => booking.userEmail === userEmail
        );

        if (alreadyBooked) {
          return res
            .status(409)
            .json({ error: "You have already booked this group." });
        }

        const bookingEntry = {
          userEmail,
          bookedAt: new Date(),
        };

        await groupCollection.updateOne(
          { _id: groupObjectId },
          { $push: { bookings: bookingEntry } }
        );

        res.status(200).json({ message: "Booking successful." });
      } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ error: "Internal server error." });
      }
    });

    // await client.db("admin").command({ ping: 1 });
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
