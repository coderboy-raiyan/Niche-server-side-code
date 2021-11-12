const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
// middleware

app.use(cors());
app.use(express.json());

// database starts here

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pqspl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database functionalities starts here

async function run() {
  try {
    await client.connect();
    const database = client.db("Cars");
    const carsCollection = database.collection("all_cars");
    const ordersCollection = database.collection("all_orders");
    const usersCollection = database.collection("all_users");
    const userReviewsCollection = database.collection("all_reviews");

    // get all the products from all_cars
    app.get("/cars", async (req, res) => {
      const result = await carsCollection.find({}).toArray();
      res.send(result);
    });

    // find a car from all cars
    app.get("/cars/:id", async (req, res) => {
      const carId = req.params.id;
      const query = { _id: ObjectId(carId) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    // car order
    app.post("/cars/order", async (req, res) => {
      const carData = req.body;
      const result = await ordersCollection.insertOne(carData);
      res.send(result.acknowledged);
    });

    // get all the orders
    app.get("/orders/:email", async (req, res) => {
      const orderEmail = req.params.email;
      const query = { email: orderEmail };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    // delete a order
    app.delete("/order/:orderid", async (req, res) => {
      const orderId = req.params.orderid;
      const query = { _id: ObjectId(orderId) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result.acknowledged);
    });

    // send user information to the Database
    app.post("/user", async (req, res) => {
      const userData = req.body;
      const result = await usersCollection.insertOne(userData);
      res.send(result.acknowledged);
    });

    // if user data exists in the database
    app.put("/user", async (req, res) => {
      const userData = req.body;
      const filter = { email: userData.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: userData,
      };

      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // make an admin
    app.put("/user/admin", async (req, res) => {
      const userEmail = req.body;
      const filter = { email: userEmail.email };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Users all reviews
    app.post("/user/reviews", async (req, res) => {
      const userReview = req.body;
      const result = await userReviewsCollection.insertOne(userReview);
      res.send(result);
    });

    // Load all reviews
    app.get("/user/reviews", async (req, res) => {
      const result = await userReviewsCollection.find({}).toArray();
      res.send(result);
    });

    // check admin

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });

    // post a new product
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await carsCollection.insertOne(product);
      res.send(result.acknowledged);
    });

    // delete a product from database
    app.delete("/product/:id", async (req, res) => {
      const productId = req.params.id;
      const query = { _id: ObjectId(productId) };
      const result = await carsCollection.deleteOne(query);
      res.send(result.acknowledged);
      console.log(result);
    });

    // load all orders
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    });

    // delete order from database
    app.delete("/order/:id", async (req, res) => {
      const orderId = req.params.id;
      const query = { _id: ObjectId(orderId) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });
    // update a order status
    app.put("/order/:id", async (req, res) => {
      const orderId = req.params.id;
      const filter = { _id: ObjectId(orderId) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    console.log("connected");
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
