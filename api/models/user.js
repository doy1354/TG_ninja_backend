const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const JOIN_BONUS = 500;

const userSchema = mongoose.Schema({
    tgId: {                   //this is an unique ID from telegram
        type: Number,
        required: true,
        unique: true,
    },
    farmingStartTime: {
        type: Date,
    },
    username: {
        type: String,
        default: '',
    },
    inviteNum: {
        type: Number,
        default: 0,
    },
    invitedUser: {
        type: [Number],
        default: [],
    },
    farmingStep: {
        type: Number,
        default: 1,
    },
    coinBalance: {
        type: Number,
        default: JOIN_BONUS,
    },
    startTime: {
        type: Number
    },
    dailyTasksStartTime: {
        type: [Date],
        default: Array(9).fill(null),
    },
    readArticles: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'news'
    },
    completedTasks: {
        type: [
            {
                taskId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'task'
                },
                progress: { 
                    type: Number, 
                    default: 0 
                },
            }
        ]
    },
    updated: Date,
})

userSchema.plugin(uniqueValidator);
var userData = mongoose.model('users', userSchema);
module.exports = userData;