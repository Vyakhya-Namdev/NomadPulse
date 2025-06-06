const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
});

//plugin -> automatically develop (user, password, salting & hashing)
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);