const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ffrgt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run (){

    try{
        await client.connect();
        const database = client.db('doctorPortal');
        const serviceCollection = database.collection('services');
        

        app.get('/services' , async(req , res)=>{
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services)
        })



    }
    finally{
        // await client.close();
    }


}

run().catch(console.dir);



app.get('/', ( req , res)=>{
    res.send('doctorportal connected')
})

app.listen(port , ()=>{
    console.log(`listening at ${port}`)
})