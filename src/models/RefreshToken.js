const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true }
});

RefreshTokenSchema.methods.toJSON = function() {
    const obj = this.toObject();
    return obj;
};

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);