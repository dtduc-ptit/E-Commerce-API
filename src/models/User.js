const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
});

userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.role;
    return obj;
};

module.exports = mongoose.model('User', userSchema);