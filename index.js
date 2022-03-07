const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser');
const pdf = require('html-pdf');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require('express-fileupload');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ffrgt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }

    }
    next();
}

async function run (){

    try{
        await client.connect();
        const database = client.db('doctorPortal');
        const serviceCollection = database.collection('services');
        const usersCollection = database.collection('users');
        const doctorsCollection = database.collection('doctors');
        const blogsCollection = database.collection('blogs')
        const prescriptionsCollection = database.collection('prescriptions')
        const appointmentsCollection = database.collection('appointments');
        const reviewsCollection = database.collection('reviews');



        app.post('/add/services', async (req, res) => {
            const service= req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result)
        });

        app.get('/services' , async(req , res)=>{
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services)
        })

        app.delete('/services/:id' , async(req , res)=>{
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            console.log(query)
            const service = await serviceCollection.deleteOne(query);
            console.log('deleted product ' , service)
            res.json(service);
        })

        app.put('/services/edit', async(req,res)=>{
        
            const id = req.body._id
            const serviceName = req.body.name;
            const servicePrice = req.body.price;
            const servieSpace = req.body.space;
            const serviceTime = req.body.time;
            
        
            const filter = {_id: ObjectId(id)};
            console.log(filter)
            
            const updateDoc = {$set:  {name:serviceName, price:servicePrice, time:serviceTime, space:servieSpace} };
            console.log(updateDoc)
            const result = await serviceCollection.updateOne(filter, updateDoc );
            console.log(result)
            res.json(result)
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
         
        app.get('/users', async (req, res) => {
            

            const cursor = usersCollection.find();
    
            const users = await cursor.toArray();
            res.json(users);
        });
          // doctors api
          app.get('/doctors', async (req, res) => {
            const cursor = doctorsCollection.find({});
            const doctors = await cursor.toArray();
            res.json(doctors);
        });

        app.get('/doctors/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const doctor = await doctorsCollection.findOne(query);
            res.json(doctor);
        });
        
        app.delete('/doctors/:id' , async(req , res)=>{
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            console.log(query)
            const doctor = await doctorsCollection.deleteOne(query);
            console.log('deleted product ' , doctor)
            res.json(doctor);
        })
      
        app.post('/doctors', async (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const doctor = {
                name,
                email,
                image: imageBuffer
            }
            const result = await doctorsCollection.insertOne(doctor);
            res.json(result);
        })
       
        //blogs api

        app.post('/blogs', async (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const photoUrl = req.body.photoURL
            const head = req.body.head;

            const blogs= req.body.blogs;

            const publishiDate = req.body.publishDate;

            const pic = req.files.blogImage;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const blog = {
                name,
                email,
                photoUrl,
                head,
                head,
                blogs,
                publishiDate,

                image: imageBuffer
            }
            const result = await blogsCollection.insertOne(blog);
            res.json(result);
        })


        app.get('/blogs/:email' , async(req ,res)=>{
            const email = req.params.email;
            const query = {email : email}
            const cursor =blogsCollection.find(query);
            const blogs = await cursor.toArray();
            res.json(blogs)

        })
        app.delete('/blogs/:id' , async(req , res)=>{
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            console.log(query)
            const blogs = await blogsCollection.deleteOne(query);
            console.log('deleted product ' , blogs)
            res.json(blogs);
        })
        app.get('/all/blogs', async (req, res) => {

            const cursor = blogsCollection.find({});
            const blogs = await cursor.toArray();
            res.json(blogs);
        })
        //apointments api

        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
          console.log(appointment)
            const result = await appointmentsCollection.insertOne(appointment);
            console.log(result)
            res.json(result)

        });
        
        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            const date = req.query.date;
             
            const query = { email: email, date: date }

            const cursor = appointmentsCollection.find(query);
            const appointments = await cursor.toArray();
            res.json(appointments);
        })


        app.get('/today/appointments', async (req, res) => {
            
            const date = req.query.date

            const query = { date: date }

            const cursor = appointmentsCollection.find(query);
            const appointments = await cursor.toArray();
            res.json(appointments);
        })

        app.get('/all/appointments', async (req, res) => {
            const cursor = appointmentsCollection.find({});
           const appointments = await cursor.toArray();
            res.json(appointments);
        });
        app.get('/panding/appointments', async (req, res) => {
            const query = { status : "pending"}
            const cursor = appointmentsCollection.find(query);
           const appointments = await cursor.toArray();
            res.json(appointments);
        });

        app.get('/patients/appointments/:email' , async(req ,res)=>{
            const email = req.params.email;
            const query = {email: email}
            const cursor =appointmentsCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders)

        })
        app.get('/appointments/:email' , async(req ,res)=>{
            const email = req.params.email;
            const query = {selectedDoctor: email}
            const cursor =appointmentsCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders)

        })

        //users api 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isRole = '';
            let isDash = false;
            let isNav = false;
            if(user?.role){
                isNav = true
            }
            if (user?.role === 'admin') {
                isRole = 'admin';
                isDash = true;
                
            }
            if (user?.role === 'doctor') {
                isRole = 'doctor';
               
            }
            res.json({ hisRole : isRole , isDash: isDash , isNav:isNav });
        })
       

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async(req,res)=>{
        
            const user =req.body;
            
            const filter = {email: user.email};
            const updateDoc = {$set:  {role:'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc );
            res.json(result)
        })
        app.put('/users/doctor', async(req,res)=>{
        
            const user =req.body;
            
            const filter = {email: user.email};
            const updateDoc = {$set:  {role:'doctor'}};
            const result = await usersCollection.updateOne(filter, updateDoc );
            res.json(result)
        })
  

        //prescription api

        app.post('/prescriptions', async (req, res) => {
            const prescription = req.body;
            const result = await prescriptionsCollection.insertOne(prescription);
            res.json(result)
        });
        app.get('/prescriptions', async (req, res) => {
            const cursor = prescriptionsCollection.find({});
           const appointments = await cursor.toArray();
            res.json(appointments);
        });


        app.get('/prescriptions/:email' , async(req ,res)=>{
            const email = req.params.email;
            const query = {doctor: email}
            const cursor =prescriptionsCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders)

        })
        app.get('/my/prescriptions/:email' , async(req ,res)=>{
            const email = req.params.email;
            const query = {patienEmail: email}
            const cursor =prescriptionsCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders)

        })
        app.get('/notification/my/prescriptions/:email' , async(req ,res)=>{
            const email = req.params.email;
            const query = {patienEmail: email}
            const cursor =prescriptionsCollection.find(query);
            const orders = await cursor.toArray();
           
            let notification = false;
            let arr =[]
            for(const person of orders){
                if (person.status === 'unread'){
                    notification = true;
                    arr.push(person)
                }

            }
            console.log(arr)
            res.json({isUnread : notification , unreadNotification : arr.length})

        })
        app.put('/prescriptions/doctor', async(req,res)=>{
        
            
            const patients = req.body.email;
             const date = req.body.update;
            const prescription =req.body.newMed;
            const filter = {patienEmail: patients};
            console.log(filter)
            const updateDoc = {$set:  {medicine: prescription , date: date} };
            const result = await prescriptionsCollection.updateOne(filter, updateDoc );
            res.json(result)
        })
        app.put('/prescriptions' , async(req , res)=>{
            const id = req.body._id;
            console.log(id)
            const filter = { _id: ObjectId(id)};
            console.log(filter)
            const updateDoc = {$set:  {status:'read'}};
            const result = await prescriptionsCollection.updateOne(filter, updateDoc );
            res.json(result)
            
        })
        //reviews collection 
        app.post('/reviews/add' , async(req , res)=>{
            const review = req.body;
          const result = await reviewsCollection.insertOne(review);
           res.json(result);
           console.log(result)
        })
    
        app.get('/reviews' , async(req , res)=>{
            const cursor = reviewsCollection.find({});
                const reviews = await cursor.toArray();
                res.json(reviews)
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