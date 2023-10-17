import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const app = express();

// middlewares
app.use(cors());

const uri = process.env.MONGO_URL;

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

    const productCollection = client.db("productDB").collection("product");

    // Send a ping to confirm a successful connection
    await client.db("productDB").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
