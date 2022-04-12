const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    Cat_id:{
        type:String
    },
    StartDeadline:{
        type: Date
    },
    EndDeadline:{
        type: Date
    },
    StartComment:{
        type: Date
    },
    EndComment:{
        type: Date
    }
})

const Datetime = mongoose.model("Datetime", Schema)
module.exports = Datetime;