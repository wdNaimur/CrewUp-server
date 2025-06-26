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
    const bookingCollection = client.db("bookingDB").collection("bookings");
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
    // Get user Groups
    app.get("/myGroup", async (req, res) => {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Missing user email in query" });
      }

      try {
        // Fetch groups for the user, sorted by startDate ascending
        const groups = await groupCollection
          .find({ userEmail: email })
          .sort({ startDate: -1 }) // change 1 to -1 for descending
          .toArray();

        for (let group of groups) {
          // Fetch bookings for the group, sorted by bookedAt descending
          const bookings = await bookingCollection
            .find({ groupId: group._id.toString() })
            .sort({ bookedAt: -1 })
            .toArray();
          group.bookings = bookings;
        }

        res.send(groups);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
        res.status(500).json({ error: "Internal server error" });
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
    // Group Details
    app.get("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const reqEmail = req.query.email;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }

      try {
        const group = await groupCollection.findOne({ _id: new ObjectId(id) });

        if (!group) {
          return res.status(404).json({ error: "Group not found" });
        }

        // Fetch all bookings related to this group
        const bookings = await bookingCollection
          .find({ groupId: id }) // stored as string (or use new ObjectId(id) if stored as ObjectId)
          .toArray();

        // Check if current user has already booked
        const alreadyBooked = bookings.some(
          (booking) => booking.userEmail === reqEmail
        );

        // Attach dynamic data
        group.bookings = bookings;
        group.alreadyBooked = alreadyBooked;

        res.send(group);
      } catch (error) {
        console.error("Error fetching group details:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    // create new Group
    app.post("/groups", async (req, res) => {
      const newGroup = req.body;
      const result = await groupCollection.insertOne(newGroup);
      res.send(result);
    });
    // Update New Group
    app.patch("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const updatedGroup = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }

      try {
        const query = { _id: new ObjectId(id) };
        const group = await groupCollection.findOne(query);

        if (!group) {
          return res.status(404).json({ error: "Group not found" });
        }

        // Count current bookings for this group
        const currentBookings = await bookingCollection.countDocuments({
          groupId: id,
        });

        // If updating maxMembers and it’s less than already booked members, reject it
        if (
          updatedGroup.maxMembers &&
          parseInt(updatedGroup.maxMembers) < currentBookings
        ) {
          return res.status(400).json({
            error: `Cannot set max members to ${updatedGroup.maxMembers} — already ${currentBookings} members booked.`,
          });
        }

        const updatedDoc = {
          $set: updatedGroup,
        };

        const result = await groupCollection.updateOne(query, updatedDoc);
        res.send(result);
      } catch (error) {
        console.error("Failed to update group:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.delete("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await groupCollection.deleteOne(query);
      res.send(result);
    });
    //All Booking Api
    // get bookings data user specific
    app.get("/myBookings", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res
          .status(400)
          .json({ error: "Email query parameter is required." });
      }

      try {
        const bookings = await bookingCollection
          .find({ userEmail: email })
          .sort({ bookedAt: -1 })
          .toArray();

        const groupIds = bookings.map(
          (booking) => new ObjectId(booking.groupId)
        );

        const groups = await groupCollection
          .find({ _id: { $in: groupIds } })
          .toArray();

        const enrichedBookings = bookings.map((booking) => {
          const group = groups.find(
            (g) => g._id.toString() === booking.groupId
          );
          return {
            ...booking,
            group,
          };
        });

        res.status(200).json(enrichedBookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        res.status(500).json({ error: "Internal server error." });
      }
    });

    app.post("/bookings", async (req, res) => {
      const {
        groupId,
        userEmail,
        groupTitle,
        bookedAt,
        details,
        category,
        meetingType,
      } = req.body;

      if (!groupId || !userEmail) {
        return res.status(400).json({ error: "Missing groupId or userEmail." });
      }

      try {
        const groupObjectId = new ObjectId(groupId);
        const group = await groupCollection.findOne({ _id: groupObjectId });

        if (!group) {
          return res.status(404).json({ error: "Group not found." });
        }

        // Check if user already booked this group
        const alreadyBooked = await bookingCollection.findOne({
          groupId,
          userEmail,
        });

        if (alreadyBooked) {
          return res
            .status(409)
            .json({ error: "You have already booked this group." });
        }

        // Build booking entry with all fields
        const bookingEntry = {
          groupId,
          userEmail,
          groupTitle,
          bookedAt: bookedAt ? new Date(bookedAt) : new Date(),
          details,
          category,
          meetingType,
        };

        // Insert booking entry
        await bookingCollection.insertOne(bookingEntry);

        res.status(200).json({ message: "Booking successful." });
      } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ error: "Internal server error." });
      }
    });
    // DELETE /bookings/:id
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const query = { _id: new ObjectId(id) };
        const result = await bookingCollection.deleteOne(query);

        if (result.deletedCount > 0) {
          res.status(200).json({
            success: true,
            message: "Booking deleted",
            deletedCount: result.deletedCount,
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Booking not found or already deleted",
            deletedCount: 0,
          });
        }
      } catch (error) {
        console.error("Error deleting booking:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
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
