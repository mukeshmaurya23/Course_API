const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDb connected to ${connection.connection.host} `);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDb;
