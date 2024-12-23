const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { FARMING_STEP } = require('../constant/constants');
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
    inviter: {
        type: Number,
        default: 0, 
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
        default: FARMING_STEP.WAITING,
    },
    coinBalance: {
        type: Number,
        default: JOIN_BONUS,
    },
    dailyTasksStartTime: {
        type: [Date],
        default: Array(9).fill(null),
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
    checkInStreak: {
        type: Number,
        default: 0, // Number of consecutive check-ins
    },
    lastClaimDate: {
        type: Date, // Last check-in date
    },
    created: Date,
})

userSchema.plugin(uniqueValidator);
var userData = mongoose.model('users', userSchema);
module.exports = userData;