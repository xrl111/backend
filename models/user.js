const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Yourname:{
        type: String
    },
    Email:{
        type: String,
        require: true,
        unique: true
    },
    Password:{
        type: String,
        require:true
    },
    Role:{
        type: String,
        require: true
    },
    
},{
    timestamps: true
})

const User = mongoose.model("User", Schema)
module.exports = User;