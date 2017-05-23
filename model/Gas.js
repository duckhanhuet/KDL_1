var mongoose = require('mongoose');

var GasSchema = mongoose.Schema({
    url:{
        type: String,
        //unique: true
    },
    latitude:{
        type: String
    },
    longitude:{
        type: String
    }
})


module.exports = mongoose.model('Gas',GasSchema);