const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    cat_name:{
        type: String
    },
},{
    timestamps: true
})

const Cat = mongoose.model("Category", Schema)
module.exports = Cat;