const express = require('express'); // express makes APIs - connect frontend to database
const Redis = require('redis'); // import Redis Class from library
const bodyParser = require('body-parser');
const cors = require('cors');

const options = {
    origin: 'http://localhost:3000' // allow our frontend to call this backend
    }

const redisClient = Redis.createClient({
    url:`redis://localHost:6379`
}); // 

const app = express(); // create an express application
const port = 3001; // port number

app.use(bodyParser.json());
app.use(cors(options)); // allow frontend to call backend

app.listen(port,()=>{
    redisClient.connect(); // connects to the redis database
    console.log(`API is listening on port: ${port}`)
}); // listen for web requests from the frontend and don't stop

app.post('/boxes', async (req, res)=>{ // async means we will await promises
    const newBox = req.body;
    newBox.id = parseInt(await redisClient.json.arrLen('boxes','$')) + 1; // auto choose ID; user shouldn't choose ID
    await redisClient.json.arrAppend('boxes','$',newBox); // saves JSON in redis
    res.json(newBox); // respond to user with new box
});

// 1 - URL
// 2 - function to return boxes
// req = the request from the browser
// res = the response to the browser
app.get('/boxes', async (req,res)=>{
    let boxes = await redisClient.json.get('boxes',{path:'$'}); // get the boxes
    // send the boxes to the browser
    res.send(JSON.stringify(boxes)); // convert boxes to JSON string
});// return boxes to user

console.log("Hello");