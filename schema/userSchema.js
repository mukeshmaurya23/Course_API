//Define schema here
/**
 * MongoDb is very schema less it means you can work without defining schema
 * it can take any sort or format of data
 * But with the mongoose schema we restrict our db to accept that define type of data
 * postman,webbrowser------->http server----->database (generally we pput db in backend becoz for security)
 * we dont want our db to expose in browser
 * To safe data ,backend(server) is acting as Auth layer for the db
 */
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  userName: String,
  email: String,
  password: String,
  purchasedCourse: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
