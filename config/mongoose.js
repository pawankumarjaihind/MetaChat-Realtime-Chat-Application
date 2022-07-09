const mongoose = require('mongoose');
const mongoDB = 'mongodb+srv://PawanKumarMetaChat:rvZqDDmeMGJl2OCe@cluster0.ikjranw.mongodb.net/messages?retryWrites=true&w=majority';

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('connected');
}).catch(err => console.log(err));
