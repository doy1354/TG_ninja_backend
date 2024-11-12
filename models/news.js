const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
    tgId: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

var newsData = mongoose.model('news', newsSchema);
module.exports = newsData;