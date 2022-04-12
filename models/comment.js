const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    idea_id:{
        type:String
    },
    Description:{
         type: String
    },
})

const Comment = mongoose.model("Comment", Schema)
module.exports = Comment;