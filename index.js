require('dotenv/config');
const express = require('express');
const fileUpload =require('express-fileupload');

const mongoose = require('mongoose')
const UserModel = require('./models/user.js')
const IdeaModel = require('./models/idea.js')
const CommentModel = require('./models/comment.js')
const DatetimeModel = require('./models/datetime.js')
const CatModel = require('./models/category.js')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const AuthToken = require('./middleware/AuthToken')
const cors = require('cors')
const app = express();
app.use(express.json())
app.use(cors())
app.use(fileUpload());
mongoose.connect('mongodb+srv://xrl001:blackd000@university.1qzbh.mongodb.net/Greenwich?retryWrites=true&w=majority')


//user route
app.post("/login",async(req,res)=>{
    const emailEnterbyUser = req.body.Email;
    const passwordEnterbyUser = req.body.Password;

    if (!emailEnterbyUser || !passwordEnterbyUser)
		return res
			.status(400)
			.json({ success: false, message: 'Missing Email and/or password' })

    try{
        //check for existing user
        UserModel.findOne({ Email: emailEnterbyUser }, function (err, uSer) {
            if (!uSer)
			return res.status(400).json({ 
                success: false, 
                message: 'Incorrect Email' 
            })
            //User found
            else {
            bcrypt.compare(passwordEnterbyUser, uSer.Password, function(err, isMatch) {
                if(!isMatch) 
                    return res.status(400).json({
                        success:false,
                        message: 'Incorrect username or password' 
                    }) 

                const accessToken = jwt.sign(
                    { userId: uSer._id },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                        expiresIn: "1m",
                    }
                )
                const  refreshToken = jwt.sign(
                    { userId: uSer._id },
                    process.env.REFRESH_TOKEN_SECRET,
                    {
                        expiresIn: "5m",
                    }
                );  
                refreshTokens.push(refreshToken);
                
                
                res.json({
                    success: true,
                    message: 'User logged in successfully',
                    accessToken
                })                      
            })    
            
        }       
        })
    } catch (err){
        console.log(err)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }  
})
let refreshTokens = [];

// Create new access token from refresh token
app.post("/token", async (req, res) => {
    const refreshToken = req.header("x-auth-token");
  
    // If token is not provided, send error message
    if (!refreshToken) {
      res.status(401).json({
        errors: [
          {
            msg: "Token not found",
          },
        ],
      });
    }

 // If token does not exist, send error message
 if (!refreshTokens.includes(refreshToken)) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid refresh token",
        },
      ],
    });
  }

  try {
    const user = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );
    // user = { email: 'jame@gmail.com', iat: 1633586290, exp: 1633586350 }
    const { email } = user;
    const accessToken = jwt.sign(
        { email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1m" }
    );
    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid token",
        },
      ],
    });
  }
});    
app.post("/register",
    async (req, res)=>{
        const Yourname = req.body.Yourname;
        const Email = req.body.Email;
        const Password = req.body.Password;
        const Role = req.body.Role;

        try{
            const user = await UserModel.findOne({ Email })

            if(user){
                return res.status(400).json({
                    success: false,
                    Email: user.Email, 
                    msg: "The Email already exists",
                })
            }
            else{
                let user = await UserModel.findOne({ Email })

                if (user){
                    return res.status(400).json({
                        success: false,
                        Email: user.Email, 
                        msg: "The user already exists",
                    })
                }
                else{
                    const salt = await bcrypt.genSalt(10);
                    
                    const hashedPassword = await bcrypt.hash(Password, salt);

                    const U = new UserModel({Yourname: Yourname, Email: Email, Password: hashedPassword, Role: Role})
                    await U.save();

                    // RETURN TOKEN
                    const accessToken = jwt.sign({userID: U._id},
                        process.env.ACCESS_TOKEN_SECRET )
                    
                    res.json({
                        success: true,
                        msg: "user created successfully!", 
                        accessToken,
                        salt: salt
                    })
                }
            }
        }catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' }),
            console.log(error)
        }
    }
)
// Deauthenticate - log out
// Delete refresh token
app.delete("/logout", (req, res) => {
    const refreshToken = req.header("x-auth-token");
  
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.sendStatus(204);
  });

  
// Idea and Comment route
app.post("/insert", async (req,res) =>{
    const Title =req.body.Title;
    const Description = req.body.Description;
    const pdfFile = rqe.body.pdfFile;
    // const file = req.body.fileUpload

    // const Like = 0;
    // const Dislike = 0;
    const idea = new IdeaModel({Title:Title, Description:Description,pdfFile:pdfFile,Like:0, Dislike:0});
    try{
        await idea.save();
        res.send("inserted new idea");
    }catch(err){
        console.log(err);
    }
})

app.post("/comment", async(req,res)=>{
    const id = req.body.id;
    const description = req.body.Description;
    const comment= new CommentModel({idea_id:id, Description:description});
    try {
        await comment.save();
    } catch (error) {
        console.log(err);
    }
})

app.get("/commentlist/", async(req,res)=>{
    CommentModel.find({},(err,result)=>{
        if (err){
            res.send(err)
        }
        res.send(result)
    })
})

app.get("/idea", async(req,res)=>{
    IdeaModel.find({},(err,result)=>{
        if (err){
            res.send(err)
        }
        res.send(result)
    })
})


//like and dislike route
app.put("/like", async(req,res)=>{
    const newlike = 1;
    const id = req.body.id;
    try{
        await IdeaModel.findById(id,(err,like)=>{
            like.Like += newlike;
            like.save();
        })
    } catch (err){
        console.log(err);
    }
})
app.put("/likef", async(req,res)=>{
    const newlike = 1;
    const id = req.body.id;
    try{
        await IdeaModel.findById(id,(err,like)=>{
            like.Like -= newlike;
            like.save();
        })
    } catch (err){
        console.log(err);
    }
})
app.put("/dislike", async(req,res)=>{
    const newlike = 1;
    const id = req.body.id;
    try{
        await IdeaModel.findById(id,(err,dislike)=>{
            dislike.Dislike += newlike;
            dislike.save();
        })
    } catch (err){
        console.log(err);
    }
})
app.put("/dislikef", async(req,res)=>{
    const newlike = 1;
    const id = req.body.id;
    try{
        await IdeaModel.findById(id,(err,like)=>{
            like.Dislike -= newlike;
            like.save();
        })
    } catch (err){
        console.log(err);
    }
})

//set date time route
app.post("/datetime",async(req,res)=>{
    const Cat_id= req.body.Cat_id;
    const StartDeadline = Date.now();
    const EndDeadline = req.body.EndDeadline;
    const StartComment = Date.now();
    const EndComment = req.body.EndComment;
    if (StartDeadline>EndDeadline||StartComment>EndComment||StartComment<StartDeadline||StartComment>EndDeadline){
       console.log('Wrong datetime!!!');
    }else{
        const datetime = new DatetimeModel({
        Cat_id:Cat_id,
        StartDeadline:StartDeadline,
        EndDeadline:EndDeadline,
        StartComment:StartComment,
        EndComment:EndComment
    })
    try{
        await datetime.save()
        console.log("đã lưu")
    } catch(e){
        console.log(e);
    }}
    
})

//set category
app.post('/NewCategory' ,async(req,res)=>{
    const check = await CatModel.findOne({cat_name:req.body.cat_name})
    if (!check){
        const cat = new CatModel({cat_name:req.body.cat_name})
        try{
           await cat.save();
        }catch(e) {
            console.log(e)
        }
    } 
})

app.get('/AllCategory', async(req,res)=>{
    CatModel.find({},(err,result)=>{
        if (err){
            res.send(err)
        }
        res.send(result)
    })
})
app.listen(3001,() =>{
    console.log('Server running on port 3001...');
});