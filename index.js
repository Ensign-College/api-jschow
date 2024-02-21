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

const express = require("express"); // express makes APIs - connect frotend to database
const Redis = require("redis"); //redis is a database, import the Redis class from the redis library
const bodyParser = require("body-parser"); //body-parser is a library that allows us to read the body of a request
const cors = require("cors"); //cors is a library that allows us to make requests from the frontend to the backend
const { addOrder, getOrder } = require("./services/orderservice.js"); //import the addOrder function from the orderservice.js file

const options = {
  origin: "http://localhost:3000", //allow requests from the frontend
};
//import redis from 'redis';//import redis library

const redisClient = Redis.createClient({
  url: `redis://localhost:6379`, //connect to redis on port 6379
}); //create a redis client
const app = express(); // create an express application
app.use(bodyParser.json()); //use the body-parser library to read JSON from the request body
app.use(cors(options)); //use the cors library to allow requests from the frontend
const port = 3001; // port to run the server on
app.listen(port, () => {
  redisClient.connect(); //connect to redis
  console.log(`API is listening on port: ${port}`); //template literal
}); //listen for web requests form the frontend and don't stop () => console.log('listening at 3000')); // listen for requests on port 3000

const Schema = require("./schema.json");

const Ajv = require("ajv");
const ajv = new Ajv();

app.post("/orders", async (req, res) => {
  let order = req.body;
  // order details
  let responseStatus = order.productQuantity ? 200 : 400;
  if (responseStatus === 200) {
    try {
      // addOrder function to handle order creation in the database
      await addOrder({ redisClient, order });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
      return;
    }
  } else {
    res.status(responseStatus);
    res.send(
      `Missing one of the following fields: ${exactMatchOrderFields()} ${partiallyMatchOrderFields()}`
    );
  }
  res.status(responseStatus).send();
});

app.get("/orders:orderId", async (req, res) => {
  // get all orders from the database
  const orderId = req.params.orderId;
  let order = await getOrder({ redisClient, orderId });
  if (order === null) {
    res.status(404).send("Order not found");
  } else {
    res.json(order);
  }
});