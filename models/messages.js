const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    room : {
        type : String,
        required : true
    },
    message : {
        type : String,
        required : true
    }, 
},
 {
    timestamps : true 
}
);



const Msg = mongoose.model('msg', msgSchema);

module.exports = Msg;