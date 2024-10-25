const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    conditionType: {
        tg_group_id: '',
        type: String,
        required: true,
    },
    link: {
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Task = mongoose.model('Task', taskSchema);

const defaultTasks = [
    {
        description: 'Subscribe to our CEO Channel',
        conditionType: 'joinGroup',
        tg_group_id: '',
        conditionValue: 1,
        reward: 1000,
        emoji: 'telegram.svg',
        link: 'https://t.me/RecaLounge',
    },
    {
        description: 'Follow our CEO on X',
        conditionType: 'link',
        tg_group_id: '',
        conditionValue: 1,
        reward: 1000,
        emoji: 'twitter.svg',        
        link: 'https://twitter.com/ResistanceCat/',
    },
    {
        description: 'Join Telegram Channel',
        conditionType: 'joinGroup2',
        tg_group_id: '',
        conditionValue: 1,
        reward: 1000,
        emoji: 'telegram.svg',
        link: 'https://t.me/ResistanceCatTon',
    },
    {
        description: 'Join TimeFarm',
        conditionType: 'link',
        tg_group_id: '',
        conditionValue: 1,
        reward: 500,
        emoji: 'time_farm.png',
        link: 'https://t.me/TimeFarmCryptoBot',
    },
    {
        description: 'Play Hexacore Gaming Universe',
        conditionType: 'link',
        tg_group_id: '',
        conditionValue: 1,
        reward: 500,
        emoji: 'hexacore.png',
        link: 'https://t.me/TapGoatBot',
    },
    {
        description: 'Welcome to Hexn',
        conditionType: 'no',
        tg_group_id: '',
        conditionValue: 1,
        reward: 500,
        emoji: 'hexn.png',
        link: '',
    },    
];

async function initializeDefaultTasks() {
    try {
        for (const task of defaultTasks) {
            const taskExists = await Task.findOne({ description: task.description });
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
