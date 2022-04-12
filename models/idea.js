const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Title:{
        type: String,
        require: true
    },
    Description:{
         type: String,
         required:true
    },
    pdfFile:{
        type:String
    },
    Like:{
        type:Number
    },
    Dislike:{
        type:Number
    }
})

const Idea = mongoose.model("Idea", Schema)
module.exports = Idea;