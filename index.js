const express = require('express'); // express makes APIs - connect frontend to database
const Redis = require('redis'); // import Redis Class from library
const bodyParser = require('body-parser');

const redisClient = Redis.createClient({
    url:`redis://localHost:6379`
}); // 

const app = express(); // create an express application
const port = 3000; // port number
app.listen(port,()=>{
    redisClient.connect(); // connects to the redis database
    console.log(`API is listening on port: ${port}`)
}); // listen for web requests from the frontend and don't stop

// 1 - URL
// 2 - function to return boxes
// req = the request from the browser
// res = the response to the browser
app.get('/boxes', async (req,res)=>{
    let boxes = await redisClient.json.get('boxes',{path:'$'}); // get the boxes
    // send the boxes to the browser
    res.send(JSON.stringify(boxes)); // convert boxes to JSON string
});// return boxes to user

app.post('/boxes', async (req, res) => {
    try {
        // Assuming the request body contains information about the new box
        const newBoxData = req.body; // Adjust this based on your actual data structure

        // Add the new box to the existing list of boxes in the Redis database
        let boxes = await redisClient.json.get('boxes', { path: '$' }) || []; // get existing boxes
        boxes.push(newBoxData);

        await redisClient.json.set('boxes', { path: '$', value: boxes }); // Update the boxes in the Redis database

        // Send a success response to the browser
        res.status(201).send("Box created successfully");
    } catch (error) {
        console.error("Error creating box:", error);
        res.status(500).send("Internal Server Error"); // Send an error response to the browser
    }
});

console.log("Hello");