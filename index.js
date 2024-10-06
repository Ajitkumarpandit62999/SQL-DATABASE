const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = "8000";
const path = require("path");
const methodOverride = require("method-override");
const {v4: uuidv4} = require('uuid');
const fs = require("fs");

app.use(methodOverride("_method"));
app.set("veiws engine" , "ejs");
app.set("views" , path.join(__dirname , "/views"));
app.use(express.urlencoded({extended:true}));

const currentDate = new Date();
const currentTime = currentDate.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', second:'2-digit', hour12: true });

// middle ware example -- plugin



// app.use((req , res , next)=>{
//     console.log("hello from midle ware");
// req.myname = "ajit kumar" // request can acees from any where
//     return res.json({msg:"kya hal hai"});
// })

app.use((req , res , next)=>{
  fs.appendFile("log.txt" , `\n ${currentTime} :  ${req.ip} :  ${req.method}: ${req.path}\n` , (err , data)=>{
    next();
  });
})

const connection =  mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Ajit@62999'
  });


// inserting new data

// let query = "INSERT INTO user (id , username , email , password) VALUES ?  ";

let getRandomUser = () => {
  return [
   faker.string.uuid(),
   faker.internet.userName(),
   faker.internet.email(),
  faker.internet.password(),
];
}


app.listen(port , (req , res)=>{
  console.log(`server i listening to port ${port}`);
})


// print th number of users in data base 
app.get("/"  , (req , res)=>{

 let q = `SELECT count(*) FROM user`;
  try {
        connection.query(q , (err , result) => {
            if(err) throw err;
            let count = result[0] ["count(*)"];
            res.render("home.ejs" , {count});
        });
         
    } catch (err) {
        console.log(err);
        res.send("some error in db")
    }
 
})

// show users route  display users details 

app.get("/users" , (req ,res)=> {

let query = `SELECT * FROM user`;
try {
  connection.query(query , (err , result) => {
      if(err) throw err;
      // console.log(result);

      // custom header
      res.setHeader("X-myname" , "ajit kumar"); //always add x to custom headers
      res.render("users.ejs" , {result});
  });
   
} catch (err) {
  console.log(err);
  res.send("some error in db")
}


})

//Edit route 

app.get("/users/:id/edit" , (req , res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q , (err , result)=>{
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs" , {user})
    })

  } catch (error) {
    console.log(err);
    res.send("some error in db")
  }

})

// update route 

app.patch("/users/:id" , (req , res)=>{
  let {id , password} = req.params;
  let {password:formpass , username:newUsername} = req.body;

  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q , (err , result)=>{
      if (err) throw err;
      let user = result[0];
      if(formpass != user.password){
        res.send("wrong password try again")
      }else{
            let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}' `;
            connection.query(q2 , (err , result)=>{
              if(err)  throw err;
              res.redirect("/users");
            });
      }
    })

  } catch (error) {
    console.log(err);
    res.send("some error in db")
  }
})

app.get("/users/add" , (req , res)=>{
  res.status(201).render("AddUser.ejs");
})

app.post("/users" , (req , res)=>{
  let {username , email , password }=req.body;
  let id = uuidv4();

  let q = `INSERT INTO  user (id , username , email , password) VALUES 
  ('${id}' , '${username}' ,'${email}' , '${password}')`;

  try {
    connection.query(q , (err , result)=>{
      if (err) throw err;
      console.log(result);
      res.redirect("/users")
    })

  } catch (error) {
    console.log(err);
    res.send("some error in db")
  }

})

app.delete("/users/:id/delete" , (req , res)=>{
    let {id} = req.params;
   
    let q = `DELETE FROM user WHERE id = '${id}'`;
    try {
      connection.query(q , (err , result)=>{
        if (err) throw err;
        console.log(result);
        res.redirect("/users")
      })
  
    } catch (error) {
      console.log(err);
      res.send("some error in db")
    }
  

})


// let data = [];

// for(let i =1 ; i<=100 ; i++){
//   data.push(getRandomUser());
// }

// try {
//     connection.query(query , [data],  (err , result) => {
//         if(err) throw err;
//         console.log(result);
//     })
     
// } catch (err) {
//     console.log(err);
// }

// connection.end();




