const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
//middleware
app.use(cors());
app.use(express.json());

// server start
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Server connected with mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.33slg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db("lensCardDb");
    const lensCollection = database.collection("glasses");
    const OrderCollection = database.collection("Orders");
    const UserCollection = database.collection("Users");
    const ReviewCollection = database.collection("Review");

    // getting data from database
    app.get("/glasses", async (req, res) => {
      const query = lensCollection.find({});
      const result = await query.toArray();
      res.json(result);
    });
    ///Sending data to the database
    app.post("/addItem", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await lensCollection.insertOne(data);
      res.send(result);
    });

    //Fetching specific data with the help of id
    app.get("/glasses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await lensCollection.find(query).toArray();
      res.send(result);
    });

    //sending order to the database
    app.post("/order", async (req, res) => {
      const data = req.body;
      const result = await OrderCollection.insertOne(data);
      res.send(result);
    });
    //Finding all the order list
    app.get("/myorder", async (req, res) => {
      const query = await OrderCollection.find({}).toArray();
      res.send(query);
    });
    //Finding data by email
    app.get("/myorder/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await OrderCollection.find(query).toArray();
      res.send(result);
    });
    // /sending user data to the database
    app.post("/users", async (req, res) => {
      const data = req.body;
      const result = await UserCollection.insertOne(data);
      res.send(result);
    });
    //Remove My order
    app.delete("/removeOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await OrderCollection.deleteOne(query);
      res.json(result);
    });
    //Remove order from admin
    app.delete("/removeAdminOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await OrderCollection.deleteOne(query);
      res.json(result);
    });
    //Approve order status
    app.put("/updateStatus/:id", async (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body;
      const filter = { _id: ObjectId(id) };
      console.log(updatedStatus);
      const updateDoc = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await OrderCollection.updateOne(filter, updateDoc);
      res.send(result);
      console.log(result);
    });
    ///Add Review
    app.post("/review", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await ReviewCollection.insertOne(data);
      res.send(result);
    });
    //Get review data
    app.get("/review", async (req, res) => {
      const query = await ReviewCollection.find({}).toArray();
      res.json(query);
    });
    //Remove Product
    app.delete("/removeProduct/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await lensCollection.deleteOne(query);
      res.send(result);
      console.log(result);
    });
    //Make Admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body.email;
      const filter = { email: user };
      const option = { upsert: true };
      const updateDoc = { $set: { role: "admin" } };
      const result = await UserCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.send(result);
    });
    //Getting the admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await UserCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
