const mongoose = require('mongoose');

const performedTaskSchema = new mongoose.Schema({
  tgId: {
    type: Number,
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task', // Reference the Task model
    required: true,
  },
  progress: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PerformedTask = mongoose.model('PerformedTask', performedTaskSchema);

module.exports = {
  PerformedTask,
};
