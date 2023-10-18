import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

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

    app.get("/api/products", async (req, res) => {
      try {
        const cursor = productCollection.find();
        const products = await cursor.toArray();
        res.status(200).json({ status: "success", data: products });
      } catch (error) {
        console.log("[PRODUCTS_GET]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
    });

    app.get("/api/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const product = await productCollection.findOne(query);
        res.status(200).json({
          status: "success",
          data: product,
        });
      } catch (error) {
        console.log("[PRODUCT_GET]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
    });

    app.post("/api/products", async (req, res) => {
      try {
        const newProducts = req.body;

        const { imageUrl, name, brandName, type, price, description, rating } =
          newProducts;

        if (
          !imageUrl ||
          !name ||
          !brandName ||
          !type ||
          !price ||
          !description ||
          rating
        )
          return res.status(400).json({
            status: "error",
            message: "Missing required fields",
          });

        if (price < 1 || rating < 1 || rating > 5)
          return res.status(400).json({
            status: "error",
            message: "Please provide valid input value",
          });

        const product = await productCollection.insertOne(newProducts);

        res.status(200).json({
          status: "success",
          data: product,
        });
      } catch (error) {
        console.log("[PRODUCTS_POST]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
    });

    const brandCollection = client.db("productDB").collection("brand");

    app.get("/api/brands", async (req, res) => {
      try {
        const cursor = brandCollection.find();
        const brands = await cursor.toArray();
        res.status(200).json({ status: "success", data: brands });
      } catch (error) {
        console.log("[BRANDS_GET]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
    });

    app.get("/api/brands/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const brand = await brandCollection.findOne(query);
        res.status(200).json({
          status: "success",
          data: brand,
        });
      } catch (error) {
        console.log("[BRAND_GET]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
    });

    app.post("/api/brands", async (req, res) => {
      const data = req.body;

      const brand = await brandCollection.insertOne(data);
      return res.json(brand);
    });

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
