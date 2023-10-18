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
          !rating
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

    // Brands

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

    app.post("/api/brands", async (req, res) => {
      const data = req.body;

      const brand = await brandCollection.insertOne(data);
      return res.json(brand);
    });

    // Brands Product
    const brandsProductCollection = client
      .db("productDB")
      .collection("brandsProduct");

    app.get("/api/brands/:brandName/products", async (req, res) => {
      try {
        const name = req.params.brandName;
        const query = { brandName: name };

        const products = await brandsProductCollection.find(query).toArray();

        res.status(200).json({
          status: "success",
          data: products,
        });
      } catch (error) {
        console.log("[BRAND_PRODUCTS_GET]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
    });

    app.get("/api/brands/:brandName/products/:id", async (req, res) => {
      try {
        const name = req.params.brandName;
        const id = req.params.id;

        const query = { _id: new ObjectId(id), brandName: name };

        const product = await brandsProductCollection.findOne(query);

        res.status(200).json({
          status: "success",
          data: product,
        });
      } catch (error) {
        console.log("[BRAND_PRODUCT_GET]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
    });

    app.post("/api/brandsProduct", async (req, res) => {
      const data = req.body;

      const brand = await brandsProductCollection.insertMany(data);
      return res.json(brand);
    });

    app.patch("/api/brands/:brandName/products/:id", async (req, res) => {
      try {
        const name = req.params.brandName;
        const id = req.params.id;
        const data = req.body;

        const filter = { _id: new ObjectId(id), brandName: name };
        const update = { $set: data };
        const options = { upsert: false };

        const updatedProduct = await brandsProductCollection.updateOne(
          filter,
          update,
          options
        );

        res.status(200).json({
          status: "success",
          data: updatedProduct,
        });
      } catch (error) {
        console.log("[BRAND_PRODUCT_PATCH]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
    });

    app.delete("/api/brandsProduct", async (req, res) => {
      const brand = await brandsProductCollection.deleteMany({});
      return res.json(brand);
    });

    // Cart collection
    const cartCollection = client.db("productDB").collection("Cart");

    app.get("/api/carts/:userId", async (req, res) => {
      try {
        const id = req.params.userId;
        const query = { _id: new ObjectId(id) };

        const data = await cartCollection.find(query).toArray();

        res.status(200).json({
          status: "success",
          data,
        });
      } catch (error) {
        console.log("[CARTS_GET]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
    });

    app.post("/api/carts", async (req, res) => {
      try {
        const newItem = req.body;
        const { userId, productId } = newItem;

        if ((!userId, !productId))
          return res.status(400).json({
            status: "error",
            message: "Missing required fields",
          });

        const data = await cartCollection.insertOne(newItem);

        res.status(200).json({
          status: "success",
          data,
        });
      } catch (error) {
        console.log("[CARTS_POST]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
    });

    app.delete("/api/carts/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };

        const data = await cartCollection.deleteOne(filter);

        res.status(200).json({
          status: "success",
          data,
        });
      } catch (error) {
        console.log("[CARTS_DELETE]", error);
        res.status(500).json({
          status: "error",
          message: "Internal error",
        });
      }
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
