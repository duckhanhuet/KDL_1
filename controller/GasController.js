var Gas = require('../model/Gas');

module.exports =  {
    find: function (params, callback) {
        Gas.find(params,function (err, gass) {
            if (err){
                callback(err,null);
                return;
            }
            callback(null,gass);
        })
    },

    findById: function (id, callback) {
        Gas.findById(id,function (err, gas) {
            if (err){
                callback(err,null);
                return;
            }
            callback(null,gas);
        })
    },

    create: function (params, callback) {
        Gas.create(params,function (err, gas) {
            if (err){
                callback(err,null);
                return;
            }
            callback(null,gas);
        })
    },
    update: function (id, params, callback) {
        Gas.findByIdAndUpdate(id,params,{new: true},function (err, gas) {
            if (err){
                callback(err,null);
                return;
            }
            callback(null,gas);
        })
    },
    delete: function (id, callback) {
        Gas.findByIdAndRemove(id,function (err) {
            if (err){
                callback(err,null);
                return;
            }
            callback(null,null);
        })
    }
}