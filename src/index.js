// require('dotenv').config('./env')
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    // app.on("error", () => {
    //   console.log("Error: ", error);
    //   throw error;
    // });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGoDB connection failed !!!", err);
  });

/*
import express from "express";
const app = express();
(async()=>{
    try {
        mongoose.connect(`${process_params.env.MONGODB_URI}/${DB_NAME}`)
        app.on('error',()=>{
            console.log("ERROR: ",error);
            throw error
            
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`app is litening on port: ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("ERROR : ", error)
        throw error
    }
})()
    */
