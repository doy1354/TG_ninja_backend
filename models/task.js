const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    conditionType: {
        type: String,
        required: true,
        default: 'click',
    },
    url: {
        type: String,
    },
    verificationCode: {
        type: String,
    },
    conditionValue: {
        type: Number,
        default: 0,
    },
    reward: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    progress: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Task = mongoose.model('Task', taskSchema);

const defaultTasks = [
    {
        title: 'Subscribe to NINJA World TG Channel',
        category: 'socials',
        icon: "telegram.png",
        conditionType: 'click',
        tg_group_id: '',
        conditionValue: 0,
        reward: 1000,        
        url: 'https://t.me/ninja',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Follow on X',
        category: 'socials',
        icon: "twitter.png",
        conditionType: 'click',
        tg_group_id: '',
        conditionValue: 0,
        reward: 500,        
        url: 'https://t.me/ninja',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Subscribe on YouTube',
        category: 'socials',
        icon: "youtube.png",
        conditionType: 'click',
        tg_group_id: '',
        conditionValue: 0,
        reward: 500,        
        url: 'https://t.me/ninja',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Invite 1 friend',
        category: 'friends',
        icon: "farming.png",
        conditionType: 'value',
        tg_group_id: '',
        conditionValue: 1,
        reward: 250,        
        url: '',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Invite 5 friends',
        category: 'friends',
        icon: "farming.png",
        conditionType: 'value',
        tg_group_id: '',
        conditionValue: 5,
        reward: 500,        
        url: '',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Farming 1,000 $NINJA',
        category: 'farming',
        icon: "farming.png",
        conditionType: 'value',
        tg_group_id: '',
        conditionValue: 1000,
        reward: 500,        
        url: '',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Farming 2,500 $NINJA',
        category: 'farming',
        icon: "farming.png",
        conditionType: 'value',
        tg_group_id: '',
        conditionValue: 0,
        reward: 1000,        
        url: '',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Share this Post to your Telegram story',
        category: 'share',
        icon: "telegram.png",
        conditionType: 'share',
        tg_group_id: '',
        conditionValue: 0,
        reward: 500,        
        url: '',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Watch this Youtube video',
        category: 'watch',
        icon: "youtube.png",
        conditionType: 'watch',
        tg_group_id: '',
        conditionValue: 0,
        reward: 500,        
        url: 'https://youtube.com/ninja',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Watch Video on X',
        category: 'watch',
        icon: "twitter.png",
        conditionType: 'watch',
        tg_group_id: '',
        conditionValue: 0,
        reward: 500,        
        url: 'https://youtube.com/ninja',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Follow NINJA World on Telegram',
        category: 'slider',
        icon: "telegram.png",
        conditionType: 'click',
        tg_group_id: '',
        conditionValue: 0,
        reward: 100,        
        url: 'https://t.me/ninjaworldcrypto',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Join the NINJA World Community',
        category: 'slider',
        icon: "telegram.png",
        conditionType: 'click',
        tg_group_id: '',
        conditionValue: 0,
        reward: 100,        
        url: 'https://t.me/ninjaworldgames',
        verificationCode: '',
        progress: 0,
    },

];

async function initializeDefaultTasks() {
    try {
        for (const task of defaultTasks) {
            const taskExists = await Task.findOne({ title: task.title });
            if (!taskExists) {
                const newTask = new Task(task);
                await newTask.save();
            }
        }
        console.log('Default tasks initialized');
    } catch (error) {
        console.error('Error initializing default tasks:', error);
    }
}

module.exports = {
    Task,
    initializeDefaultTasks,
};
