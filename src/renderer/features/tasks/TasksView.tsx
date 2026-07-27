import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import {
  IconPlus,
  IconCheck,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconTasks,
} from '../../components/ui/Icons';

type TaskFilter = 'all' | 'active' | 'completed';

export const TasksView: React.FC = () => {
  const { data, addTask, toggleTask, deleteTask, moveTask, clearCompletedTasks } = useStorage();
  const [taskInput, setTaskInput] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');

  const tasks = data.tasks || [];
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (taskInput.trim()) {
      addTask(taskInput);
      setTaskInput('');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="tasks-container animate-fade-in">
      {/* Header & Progress Card */}
      <div className="glass-card tasks-header-card">
        <div className="tasks-header-left">
          <div className="header-icon-box">
            <IconTasks size={24} />
          </div>
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.2rem' }}>Today's Priority Checklist</h2>
            <p className="section-subtitle">Focus on what matters most today. Keep it simple and clear.</p>
          </div>
        </div>

        <div className="progress-box">
          <div className="progress-text">
            <span>{completedCount} of {totalCount} completed</span>
            <span className="percent-text">{progressPercent}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Task Creation & Filters */}
      <div className="glass-card tasks-control-card">
        <form onSubmit={handleAddTask} className="task-input-form">
          <input
            type="text"
            className="task-input"
            placeholder="Add a new task for today... (e.g. Finish Chapter 4, Code IPC bridge)"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <IconPlus size={18} />
            <span>Add Task</span>
          </button>
        </form>

        <div className="tasks-filter-row">
          <div className="filter-chips">
            <button
              onClick={() => setFilter('all')}
              className={`chip-btn ${filter === 'all' ? 'active' : ''}`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`chip-btn ${filter === 'active' ? 'active' : ''}`}
            >
              Active ({totalCount - completedCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`chip-btn ${filter === 'completed' ? 'active' : ''}`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {completedCount > 0 && (
            <button onClick={clearCompletedTasks} className="btn-secondary btn-sm">
              Clear Completed
            </button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="glass-card tasks-list-card">
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks-state">
            <p className="empty-title">
              {totalCount === 0
                ? "No tasks added for today yet!"
                : filter === 'active'
                ? "All tasks are completed! Great job 🎉"
                : "No completed tasks yet."}
            </p>
            <p className="empty-sub">Type a priority above and press Enter to get started.</p>
          </div>
        ) : (
          <div className="task-items-list">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''}`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                  title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && <IconCheck size={14} />}
                </button>

                <span className="task-text">{task.text}</span>

                <div className="task-actions">
                  <button
                    onClick={() => moveTask(task.id, 'up')}
                    disabled={index === 0}
                    className="btn-icon-subtle"
                    title="Move Up"
                  >
                    <IconArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveTask(task.id, 'down')}
                    disabled={index === filteredTasks.length - 1}
                    className="btn-icon-subtle"
                    title="Move Down"
                  >
                    <IconArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="btn-icon-danger"
                    title="Delete Task"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
