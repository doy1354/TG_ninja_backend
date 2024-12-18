const { Task } = require('../models/task');
const User = require('../models/user');
const { PerformedTask } = require('../models/performedTask'); // Import PerformedTask model

const createTask = async (req, res) => {
  const taskData = new Task(req.body.task);
  try {
    await taskData.save();
    return res.status(200).json({
      success: true,
      message: "Task created successfully!",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const allTasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ allTasks });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getAllTasksForUser = async (req, res) => {
  const tgId = req.params.tgId;

  try {
    // Get all active tasks
    const allTasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });

    // Get all performed tasks for this user
    const performedTasks = await PerformedTask.find({ tgId });

    // Get user data to check requirements
    const user = await User.findOne({ tgId: tgId });

    // Process tasks and check requirements
    const tasksWithProgress = await Promise.all(allTasks.map(async (task) => {
      const performedTask = performedTasks.find(pt =>
        pt.taskId.toString() === task._id.toString()
      );

      // Check requirements for farming and friend categories
      if (!performedTask && (task.category === 'farming' || task.category === 'friends')) {
        const meetsRequirements = await checkTaskRequirements(task, user);

        if (meetsRequirements) {
          // Create new performed task with 'claim' status
          const newPerformedTask = await PerformedTask.create({
            tgId,
            taskId: task._id,
            progress: 'claim'
          });

          return {
            ...task.toObject(),
            progress: newPerformedTask.progress
          };
        }
      }

      return {
        ...task.toObject(),
        progress: performedTask ? performedTask.progress : 'start'
      };
    }));

    return res.status(200).json({ tasks: tasksWithProgress });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Helper function to check task requirements
const checkTaskRequirements = async (task, user) => {
  if (task.category === 'farming') {
    return user.coinBalance >= task.conditionValue
  }

  if (task.category === 'friends') {
    return user.inviteNum >= task.conditionValue
  }

  return false;
};


const getTaskById = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    return res.status(200).json({ task });
  } catch (err) {
    console.log("Error fetching task by ID:", err);
    return res.status(500).json({ error: err.message });
  }
};

const editTask = async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body.task;
  try {
    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true, runValidators: true });
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    return res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (err) {
    console.log("Error updating task:", err);
    return res.status(500).json({ error: err.message });
  }
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (err) {
    console.log("Error deleting task:", err);
    return res.status(500).json({ error: err.message });
  }
};


const updatePerformedTask = async (req, res) => {
  let updateData
  let tgId = req.body.tgId
  let taskId = req.body.taskId

  try {
    // Check if task already exists for this user
    const existingTask = await PerformedTask.findOne({
      tgId: req.body.tgId,
      taskId: req.body.taskId
    });

    let progress = '';
    if (existingTask) {
      if (existingTask.progress == 'start') {
        if (task.verificationCode) {
          progress = 'verify';
        } else {
          progress = 'claim';
        }
      } else if (existingTask.progress == 'verify') {
        progress = 'claim';
      } else {
        progress = 'completed';
      }

      updateData = await PerformedTask.findByIdAndUpdate(
        existingTask._id,
        { progress: progress },
        { new: true } // Return the updated document
      );

      console.log('progress', progress)
      if (updateData.tgId && progress == 'completed') {
        const task = await Task.findById(taskId);
        console.log('task', task)
        await User.findOneAndUpdate(
          { tgId: tgId },
          { $inc: { coinBalance: task.reward } },
          { new: true }
        );
      }
    } else {
      // Get the task details
      const task = await Task.findById(req.body.taskId);

      // Set initial progress based on task properties
      let initialProgress = 'start';

      if (task.category === 'farming' || task.category === 'friends') {
        initialProgress = 'claim';
      } else {
        if (task.verificationCode) {
          initialProgress = 'verify';
        } else {
          initialProgress = 'claim';
        }
      }

      // Create performed task with determined progress
      const performedTaskData = new PerformedTask({
        ...req.body,
        progress: initialProgress
      });

      updateData = await performedTaskData.save();
    }

    return res.status(200).json({ updateData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const verifyTask = async (req, res) => {
  const { tgId, taskId, verificationCode } = req.body;

  try {
    // Validate input
    if (!taskId) {
      return res.status(400).json({ error: 'taskId are required' });
    }

    // Find the task details
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate verification code if required
    if (task.verificationCode && task.verificationCode !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    } else {
      const existingTask = await PerformedTask.findOne({ tgId, taskId });
      if (existingTask) {
        // Update the progress of the existing performed task
        const updatedTask = await PerformedTask.findByIdAndUpdate(
          existingTask._id,
          { progress: "claim" },
          { new: true } // Return the updated document
        )
        return res.status(200).json({
          success: true,
          message: 'verification successful',
          updatedTask
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createTask,
  getAllTasks,
  getAllTasksForUser,
  getTaskById,
  editTask,
  deleteTask,
  updatePerformedTask,
  verifyTask,
};
