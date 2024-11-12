const { Task } = require('../models/task')

const createTask = async (req, res) => {
  const taskData = new Task(req.body)
  try {
    await taskData.save()
    return res.status(200).json({
      message: "ok!"
    })
  } catch (err) {

    return res.status(500).json({
      error: err
    })
  }
}

const getAllTasks = async (req, res) => {
  try {
    const allTasks = await Task.find({ isActive: true }).sort({ createdAt: 1 })
    res.status(200).json({ allTasks })
  } catch (err) {
    console.log("e", err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createTask,
  getAllTasks,

}