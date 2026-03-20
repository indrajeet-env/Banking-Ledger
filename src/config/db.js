const mongoose = require('mongoose');

function connectToDB(){
  mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('server is connected to DB');
    })
    .catch((err) => {
      console.log('server is not connected to DB');
      console.log(err);
      process.exit(1) //if there is an error in connecting to DB, then we want to stop the server, so we use process.exit(1) to stop the server
    })
}

module.exports = connectToDB;