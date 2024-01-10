const express = require('express'); // express makes APIs - connect frontend to database

const app = express(); // create an express application

app.listen(3000); // listen for web requests from the frontend and don't stop

const boxes = [
    {boxId:1},
    {boxId:2},
    {boxId:3},
    {boxId:4}
];

// 1 - URL
// 2 - function to return boxes
// req = the request from the browser
// res = the response to the browser
app.get('/boxes',(req,res)=>{
    // send the boxes to the browser
    res.send(JSON.stringify(boxes));
});// return boxes to user

console.log("Hello");