
import React from 'react';
import { Task, Priority, Category } from '../types';
import { CheckCircle, Circle, Trash2, Calendar, Tag, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onBreakdown: (id: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onBreakdown, onToggleSubTask }) => {
  const [expanded, setExpanded] = React.useState(false);

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'text-rose-600 bg-rose-50 border-rose-200';
      case Priority.MEDIUM: return 'text-amber-600 bg-amber-50 border-amber-200';
      case Priority.LOW: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  const categoryColors: Record<string, string> = {
    [Category.WORK]: 'bg-blue-100 text-blue-700',
    [Category.PERSONAL]: 'bg-purple-100 text-purple-700',
    [Category.HEALTH]: 'bg-green-100 text-green-700',
    [Category.SHOPPING]: 'bg-orange-100 text-orange-700',
    [Category.FINANCE]: 'bg-emerald-100 text-emerald-700',
    [Category.OTHER]: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className={`group relative bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:border-indigo-200 ${task.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-4">
        <button 
          onClick={() => onToggle(task.id)}
          className="mt-1 transition-transform active:scale-125"
        >
          {task.completed ? (
            <CheckCircle className="w-6 h-6 text-indigo-500 fill-indigo-50" />
          ) : (
            <Circle className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold text-lg transition-all ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2">
              {task.subTasks.length === 0 && !task.completed && (
                <button 
                  onClick={() => onBreakdown(task.id)}
                  title="AI 智能分解"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <BrainCircuit className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => onDelete(task.id)}
                title="删除任务"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-3 line-clamp-2">
            {task.description}
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className={`px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${categoryColors[task.category]}`}>
              <Tag className="w-3 h-3" />
              {task.category}
            </span>
            {task.dueDate && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {task.subTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider mb-2"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            子任务 ({task.subTasks.filter(sub => sub.completed).length}/{task.subTasks.length})
          </button>
          
          {expanded && (
            <div className="space-y-2 ml-10 animate-in slide-in-from-top-2 duration-300">
              {task.subTasks.map(sub => (
                <div key={sub.id} className="flex items-center gap-3">
                  <button 
                    onClick={() => onToggleSubTask(task.id, sub.id)}
                    className="transition-transform active:scale-125"
                  >
                    {sub.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                  <span className={`text-sm ${sub.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                    {sub.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
