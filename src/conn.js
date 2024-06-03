const mongoose = require('mongoose');

const encodedPassword = encodeURIComponent('Siddiq@03');

mongoose.connect(`mongodb+srv://siddiqkolimi:${encodedPassword}@cluster0.fpkgviw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => console.log('DB connect'))
    .catch(err => console.log(err));