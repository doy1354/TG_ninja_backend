const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: 'new',
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
    emoji: {
        type: String,
        default: '🎉',
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
        conditionType: 'click',
        tg_group_id: '',
        conditionValue: 0,
        reward: 1000,
        emoji: 'telegram.svg',
        url: 'https://t.me/ninja',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Follow on X',
        category: 'socials',
        conditionType: 'click',
        tg_group_id: '',
        conditionValue: 0,
        reward: 500,
        emoji: 'telegram.svg',
        url: 'https://t.me/ninja',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Subscribe on YouTube',
        category: 'socials',
        conditionType: 'click',
        tg_group_id: '',
        conditionValue: 0,
        reward: 500,
        emoji: 'telegram.svg',
        url: 'https://t.me/ninja',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Invite 1 friend',
        category: 'friends',
        conditionType: 'value',
        tg_group_id: '',
        conditionValue: 1,
        reward: 250,
        emoji: 'telegram.svg',
        url: '',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Invite 5 friends',
        category: 'friends',
        conditionType: 'value',
        tg_group_id: '',
        conditionValue: 5,
        reward: 500,
        emoji: 'telegram.svg',
        url: '',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Farming 1,000 $NINJA',
        category: 'farming',
        conditionType: 'value',
        tg_group_id: '',
        conditionValue: 1000,
        reward: 500,
        emoji: 'telegram.svg',
        url: '',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Farming 2,500 $NINJA',
        category: 'farming',
        conditionType: 'value',
        tg_group_id: '',
        conditionValue: 0,
        reward: 1000,
        emoji: 'telegram.svg',
        url: '',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Share this Post to your Telegram story',
        category: 'share',
        conditionType: 'share',
        tg_group_id: '',
        conditionValue: 0,
        reward: 500,
        emoji: 'telegram.svg',
        url: '',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Watch this Youtube video',
        category: 'watch',
        conditionType: 'watch',
        tg_group_id: '',
        conditionValue: 0,
        reward: 500,
        emoji: 'telegram.svg',
        url: 'https://youtube.com/ninja',
        verificationCode: '',
        progress: 0,
    },
    {
        title: 'Watch Video on X',
        category: 'watch',
        conditionType: 'watch',
        tg_group_id: '',
        conditionValue: 0,
        reward: 500,
        emoji: 'telegram.svg',
        url: 'https://youtube.com/ninja',
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
