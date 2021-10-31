const express = require('express')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const cors = require('cors')
const app = express()
const port = process.env.Port || 5000

// Middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tigkh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

console.log(uri)

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

console.log('All route should be work')

async function run() {
  try {
    await client.connect()
    const database = client.db('online_food_delivery')
    const productCollection = database.collection('products')
    const orderCollection = client
      .db('online_food_delivery')
      .collection('orders')
    const customerInformation = client
      .db('online_food_delivery')
      .collection('customer_information')

    // GET Products API
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find({})
      const products = await cursor.toArray()
      res.send(products)
    })

    // Post
    app.post('/addProduct', (req, res) => {
      productCollection.insertOne(req.body).then((result) => {
        res.send(result.insertedId)
      })
    })

    // Added Item
    app.post('/addItem', (req, res) => {
      orderCollection.insertOne(req.body).then((result) => {
        res.send(result)
      })
    })

    // Order Review
    app.get('/myOrders/:email', async (req, res) => {
      const result = await orderCollection
        .find({ email: req.params.email })
        .toArray()
      res.send(result)
    })

    // Order delete
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await orderCollection.deleteOne(query)
      res.send(result)
    })

    // Get search
    app.get('/searchEvent', async (req, res) => {
      const result = await productCollection
        .find({
          name: { $regex: req.query.search },
        })
        .toArray()
      res.json(result)
    })

    // Place order or order review
    app.post('/placeOrder', async (req, res) => {
      const result = await customerInformation.insertOne(req?.body)
      res.json(result)
    })

    app.get('/manageAllOrders/', async (req, res) => {
      const result = await customerInformation.find({}).toArray()
      res.send(result)
    })
  } finally {
    // await client.close()
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(port, () => {
  console.log('Server running at port', port)
})
