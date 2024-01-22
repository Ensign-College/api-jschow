const express = require('express'); // express makes APIs - connect frontend to database
const Redis = require('redis'); // import Redis Class from library

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
app.get('/boxes',(req,res)=>{
    let boxes = redisClient.json.get('boxes',{path:'$'}); // get the boxes
    // send the boxes to the browser
    res.send(JSON.stringify(boxes));
});// return boxes to user

console.log("Hello");