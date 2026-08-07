const prisma = require('../config/db');

// GET /api/volunteers/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const volunteers = await prisma.user.findMany({
      where: { role: { in: ['VOLUNTEER', 'ORGANIZER'] } },
      orderBy: { xp: 'desc' },
      take: 20,
      include: {
        badges: { include: { badge: true } },
        _count: { select: { tasks: true } },
      },
    });

    const formatted = volunteers.map((v, index) => ({
      id: v.id,
      rank: index + 1,
      name: v.name,
      role: v.roleTitle || 'Volunteer',
      xp: v.xp,
      level: v.level,
      badges: v.badges.length,
      tasks: v._count.tasks,
      avatar: v.avatarUrl || 'photo-1507003211169-0a1dd7228f2d',
      streak: v.streak,
      isMe: req.user ? req.user.id === v.id : false,
    }));

    res.status(200).json({ leaderboard: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        event: { select: { id: true, title: true } },
      },
    });

    // Group tasks into Kanban columns
    const grouped = {
      todo: tasks.filter(t => t.stage === 'todo').map(formatTask),
      inProgress: tasks.filter(t => t.stage === 'inProgress').map(formatTask),
      done: tasks.filter(t => t.stage === 'done').map(formatTask),
    };

    res.status(200).json({ tasks: grouped, raw: tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const formatTask = (t) => ({
  id: `t${t.id}`,
  realId: t.id,
  title: t.title,
  priority: t.priority,
  due: t.due || 'Soon',
  assignee: t.assigneeName || (t.assignee ? t.assignee.name : 'Unassigned'),
  stage: t.stage,
});

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, priority, due, stage, eventId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const task = await prisma.task.create({
      data: {
        title,
        priority: priority || 'medium',
        stage: stage || 'todo',
        due: due || 'Aug 20',
        assigneeId: req.user.id,
        assigneeName: user ? user.name : 'Volunteer',
        eventId: eventId ? parseInt(eventId) : null,
      },
    });

    res.status(201).json({ message: 'Task created', task: formatTask(task) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    let taskId = req.params.id;
    if (taskId.startsWith('t')) {
      taskId = taskId.substring(1);
    }
    const id = parseInt(taskId);

    const { stage, priority, title, due } = req.body;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(stage && { stage }),
        ...(priority && { priority }),
        ...(title && { title }),
        ...(due && { due }),
      },
    });

    // If task moved to done, award XP to volunteer!
    if (stage === 'done' && existing.stage !== 'done' && req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          xp: { increment: 150 },
        },
      }).catch(() => {});
    }

    res.status(200).json({ message: 'Task updated', task: formatTask(updatedTask) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    let taskId = req.params.id;
    if (taskId.startsWith('t')) {
      taskId = taskId.substring(1);
    }
    const id = parseInt(taskId);

    await prisma.task.delete({ where: { id } });
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// GET /api/volunteers/me/tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: req.user.id },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ tasks: tasks.map(formatTask) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch volunteer tasks' });
  }
};

module.exports = {
  getLeaderboard,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
};
