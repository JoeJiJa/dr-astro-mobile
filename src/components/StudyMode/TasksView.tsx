import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2 } from 'lucide-react';
import { Task } from './types';

interface TasksViewProps {
    tasks: Task[];
    clearCompletedTasks: () => void;
    newTask: string;
    setNewTask: (val: string) => void;
    handleAddTask: () => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
}

const TasksView: React.FC<TasksViewProps> = ({
    tasks,
    clearCompletedTasks,
    newTask,
    setNewTask,
    handleAddTask,
    toggleTask,
    deleteTask
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Daily Tasks</h2>
                {tasks.some(t => t.completed) && (
                    <button onClick={clearCompletedTasks} className="text-xs font-bold text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-wider">
                        Clear Completed
                    </button>
                )}
            </div>

            <div className="bg-[#18181b] p-2 rounded-2xl border border-zinc-800 flex gap-2">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Add a new task..."
                    className="flex-1 bg-transparent px-4 py-2 text-white outline-none placeholder:text-zinc-600"
                />
                <button
                    onClick={handleAddTask}
                    disabled={!newTask.trim()}
                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {tasks.map(task => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={task.id}
                            className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${task.completed ? 'bg-[#121212] border-zinc-800/50' : 'bg-[#18181b] border-zinc-800'
                                }`}
                        >
                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${task.completed
                                    ? 'bg-green-500 border-green-500 text-black'
                                    : 'border-zinc-600 text-transparent hover:border-zinc-400'
                                    }`}
                            >
                                <Check size={14} strokeWidth={3} />
                            </button>

                            <span className={`flex-1 font-medium transition-all ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-200'
                                }`}>
                                {task.title}
                            </span>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-500 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {tasks.length === 0 && (
                    <div className="text-center text-zinc-600 py-12 italic">
                        No tasks for today. Chill or grind!
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TasksView;
