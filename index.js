// const express = require('express'); // express makes APIs - connect frontend to database
// const Redis = require('redis'); // import Redis Class from library
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const options = {
//     origin: 'http://localhost:3000' // allow our frontend to call this backend
//     }

// const redisClient = Redis.createClient({
//     url:`redis://localHost:6379`
// }); // 

// const app = express(); // create an express application
// const port = 3001; // port number

// app.use(bodyParser.json());
// app.use(cors(options)); // allow frontend to call backend

// app.listen(port,()=>{
//     redisClient.connect(); // connects to the redis database
//     console.log(`API is listening on port: ${port}`)
// }); // listen for web requests from the frontend and don't stop

// app.post('/boxes', async (req, res)=>{ // async means we will await promises
//     const newBox = req.body;
//     newBox.id = parseInt(await redisClient.json.arrLen('boxes','$')) + 1; // auto choose ID; user shouldn't choose ID
//     await redisClient.json.arrAppend('boxes','$',newBox); // saves JSON in redis
//     res.json(newBox); // respond to user with new box
// });

// // 1 - URL
// // 2 - function to return boxes
// // req = the request from the browser
// // res = the response to the browser
// app.get('/boxes', async (req,res)=>{
//     let boxes = await redisClient.json.get('boxes',{path:'$'}); // get the boxes
//     // send the boxes to the browser
//     res.send(boxes[0]); // convert boxes to JSON string
// });// return boxes to user

// console.log("Hello");

const express = require('express');
const Redis = require('redis');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

// Redis client setup
const redisClient = Redis.createClient({
    url: 'redis://localhost:6379'
});

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:3000"
}));

// Connect to Redis and start the server
app.listen(port, async () => {
    try {
        await redisClient.connect();
        console.log(`API is listening on port: ${port}`);
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
});

// Function to add a new order item with orderId and timestamp as key
async function addOrderItemId({redisClient, orderItem}) {
    const timestamp = Date.now();
    const uniqueKey = `orderId:${orderItem.orderId}:${timestamp}`;
    await redisClient.json.set(uniqueKey, '$', orderItem);
    return uniqueKey; // Return the key for confirmation
}

// POST endpoint to add a new order item
app.post('/orderItems', async (req, res) => {
    const orderItem = req.body;
    const requiredFields = ['orderItemId', 'orderId', 'productId', 'quantity'];
    const missingFields = requiredFields.filter(field => !orderItem[field]);

    if (missingFields.length === 0) {
        try {
            const uniqueKey = await addOrderItemId({redisClient, orderItem});
            console.log(`Order item added with unique key:`,orderItem);
            res.status(201).send("New orderItem has been created.");
        } catch (error) {
            console.error("Failed to add order item:", error);
            res.status(500).send("Internal Server Error.");
        }
    } else {
        res.status(400).send(`Missing required fields: ${missingFields.join(', ')}.`);
    }
});

console.log(`Server running on port ${port}`);