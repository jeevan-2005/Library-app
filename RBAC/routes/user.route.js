const express = require("express");
const UserModel = require("../models/user.model");
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model");
require("dotenv").config();

const tokenSecretKey = process.env.TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.R_TOKEN_SECRET_KEY;

userRouter.post('/register', async (req,res)=>{
    const { email, password, name, gender, role } = req.body;
    try {
        const findUser = await UserModel.findOne({email})
        if(findUser){
            return res.status(200).send("User with this Email already exists, Please Login or try with different Email.");
        }
        bcrypt.hash(password, 8, async (err, hash)=>{
            if(err) res.status(500).send("Error occured while hashing the password");
            
            const newUser = new UserModel({email, password:hash, name, gender, role});
            await newUser.save();
            res.status(200).send("User Registration Successful.");
        })
    } catch (error) {
        console.log(error);
        res.status(415).send("User Registration Failed.")
    }
})

userRouter.post('/login', async (req,res)=>{
    const {email, password} = req.body;

    try {
        const findUser = await UserModel.findOne({email});
        if(findUser){
            bcrypt.compare(password, findUser.password, (err, result)=>{
                if(err) res.status(500).send("error occured while comparing passwords");
                if(result){
                    const token = jwt.sign({...findUser}, tokenSecretKey , {expiresIn: "1hr"});
                    const refreshToken = jwt.sign({...findUser}, refreshTokenSecretKey , {expiresIn: "1d"});
                    res.status(200).send({msg:"Login Successful", token: token, refreshToken: refreshToken});
                }else{
                    res.status(401).send("Invalid Credentials");
                }
            })
        }else{
            res.status(401).send(`User not found with email:${email}`);
        }
    } catch (error) {
        console.log(error);
        res.status(415).send("Login Failed");
    }
})

userRouter.get("/logout", async (req, res) => {
    let token = req.headers.authorization.split(" ")[1];
    let blacklistToken = new blacklistModel({ token });
    await blacklistToken.save();
    res.status(200).send({ "msg":"user logged out successfully."});
  });

module.exports = userRouter;