
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Priority, Category, TaskStats } from './types';
import { Button } from './components/Button';
import { TaskCard } from './components/TaskCard';
import { Stats } from './components/Stats';
import { CalendarView } from './components/CalendarView';
import { getSmartTaskBreakdown, getDailyQuote } from './services/geminiService';
import { Plus, Search, Filter, Sparkles, BrainCircuit, LayoutDashboard, ListChecks, Calendar as CalendarIcon, Info, TrendingUp, BarChart3 } from 'lucide-react';

type ViewType = 'overview' | 'calendar' | 'insights';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [filter, setFilter] = useState<{ category: string; priority: string; search: string }>({
    category: '全部',
    priority: '全部',
    search: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [quote, setQuote] = useState({ quote: '', author: '' });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('taskmaster_pro_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
      }
    }
    getDailyQuote().then(setQuote);
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('taskmaster_pro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // 核心统计数据计算 - 修正计算逻辑，确保总计、完成、待办准确
  const stats = useMemo((): TaskStats => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    const priorityBreakdown = {
      [Priority.LOW]: tasks.filter(t => t.priority === Priority.LOW).length,
      [Priority.MEDIUM]: tasks.filter(t => t.priority === Priority.MEDIUM).length,
      [Priority.HIGH]: tasks.filter(t => t.priority === Priority.HIGH).length,
    };

    const categoryBreakdown = Object.values(Category).reduce((acc, cat) => {
      acc[cat] = tasks.filter(t => t.category === cat).length;
      return acc;
    }, {} as Record<Category, number>);

    return { total, completed, pending, priorityBreakdown, categoryBreakdown };
  }, [tasks]);

  // 过滤后的任务列表
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchCat = filter.category === '全部' || t.category === filter.category;
      const matchPrio = filter.priority === '全部' || t.priority === filter.priority;
      const matchSearch = t.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(filter.search.toLowerCase()));
      return matchCat && matchPrio && matchSearch;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks, filter]);

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const desc = formData.get('description') as string;
    const prio = formData.get('priority') as Priority;
    const cat = formData.get('category') as Category;
    const date = formData.get('dueDate') as string;

    if (!title.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description: desc,
      priority: prio,
      category: cat,
      dueDate: date,
      completed: false,
      createdAt: Date.now(),
      subTasks: []
    };

    setTasks(prev => [newTask, ...prev]);
    setIsAdding(false);
  };

  const handleToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleToggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, completed: !st.completed } : st)
        };
      }
      return t;
    }));
  };

  const handleAIAction = async (taskId: string) => {
    setIsThinking(true);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const subtasks = await getSmartTaskBreakdown(task.title, task.description);
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subTasks: subtasks.map(text => ({ id: crypto.randomUUID(), text, completed: false }))
          };
        }
        return t;
      }));
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-72 border-r border-slate-200 bg-white flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
            <ListChecks className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">任务大师 Pro</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('overview')}
            className={`w-full justify-start transition-all ${currentView === 'overview' ? 'text-indigo-600 bg-indigo-50 font-bold' : ''}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            仪表盘
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('calendar')}
            className={`w-full justify-start transition-all ${currentView === 'calendar' ? 'text-indigo-600 bg-indigo-50 font-bold' : ''}`}
          >
            <CalendarIcon className="w-5 h-5" />
            日历视图
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('insights')}
            className={`w-full justify-start transition-all ${currentView === 'insights' ? 'text-indigo-600 bg-indigo-50 font-bold' : ''}`}
          >
            <BrainCircuit className="w-5 h-5" />
            AI 智能洞察
          </Button>
        </nav>

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-indigo-600">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI 每日语论</span>
          </div>
          <p className="text-sm italic text-slate-600 leading-relaxed mb-2">"{quote.quote || '正在获取灵感...'}"</p>
          <p className="text-xs font-semibold text-slate-400">— {quote.author || 'AI'}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full overflow-y-auto">
        {currentView === 'overview' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">今日焦点</h2>
                <p className="text-slate-400 font-medium">今天还有 {stats.pending} 个任务等待完成。</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="搜索任务..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
                    value={filter.search}
                    onChange={(e) => setFilter(prev => ({...prev, search: e.target.value}))}
                  />
                </div>
                <Button onClick={() => setIsAdding(true)} className="whitespace-nowrap rounded-xl shadow-lg">
                  <Plus className="w-5 h-5" />
                  新任务
                </Button>
              </div>
            </div>

            <Stats stats={stats} />

            <div className="flex flex-wrap items-center gap-4 mb-8 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 px-3 text-slate-400 border-r border-slate-100">
                <Filter className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">筛选条件</span>
              </div>
              <select 
                className="text-sm bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer"
                value={filter.category}
                onChange={(e) => setFilter(prev => ({...prev, category: e.target.value}))}
              >
                <option value="全部">全部分类</option>
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select 
                className="text-sm bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer"
                value={filter.priority}
                onChange={(e) => setFilter(prev => ({...prev, priority: e.target.value}))}
              >
                <option value="全部">全部优先级</option>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="grid gap-4 mb-20">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onBreakdown={handleAIAction}
                    onToggleSubTask={handleToggleSubTask}
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium">没有找到符合条件的任务。</p>
                  <button onClick={() => setFilter({category:'全部', priority:'全部', search:''})} className="mt-2 text-indigo-600 text-sm font-semibold hover:underline">清除所有筛选</button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">日历视图</h2>
            <p className="text-slate-400 font-medium mb-10">按日期直观管理您的时间表。</p>
            <CalendarView tasks={tasks} />
          </div>
        )}

        {currentView === 'insights' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">AI 智能洞察</h2>
            <p className="text-slate-400 font-medium mb-10">基于您的历史数据提供的效率建议。</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
                <TrendingUp className="w-8 h-8 mb-4 opacity-80" />
                <div className="text-3xl font-bold mb-1">{stats.completed}</div>
                <div className="text-sm opacity-80 font-medium">总计已完成任务</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <BarChart3 className="w-8 h-8 mb-4 text-emerald-500" />
                <div className="text-3xl font-bold mb-1 text-slate-800">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</div>
                <div className="text-sm text-slate-400 font-medium">任务完成率</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <BrainCircuit className="w-8 h-8 mb-4 text-rose-500" />
                <div className="text-3xl font-bold mb-1 text-slate-800">{stats.priorityBreakdown[Priority.HIGH]}</div>
                <div className="text-sm text-slate-400 font-medium">紧急待办项</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-800">AI 效率建议</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 text-white font-bold">1</div>
                  <p className="text-slate-600 text-sm leading-relaxed pt-2">
                    您当前有 <span className="font-bold text-indigo-700">{stats.pending}</span> 个未完成任务。建议在上午的高能时段优先处理高优先级任务。
                  </p>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shrink-0 text-white font-bold">2</div>
                  <p className="text-slate-600 text-sm leading-relaxed pt-2">
                    使用任务分解功能可以将大目标拆解为更小的可执行步骤。目前您已通过 AI 完成了初步规划。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Task Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">创建新任务</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">标题</label>
                <input required name="title" autoFocus placeholder="需要做什么？" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">描述</label>
                <textarea name="description" placeholder="添加更多细节..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 h-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">优先级</label>
                  <select name="priority" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100">
                    <option value={Priority.LOW}>低</option>
                    <option value={Priority.MEDIUM}>中</option>
                    <option value={Priority.HIGH}>高</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">分类</label>
                  <select name="category" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100">
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">截止日期</label>
                <input name="dueDate" type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsAdding(false)} className="flex-1">取消</Button>
                <Button type="submit" className="flex-1">创建任务</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thinking Overlay */}
      {isThinking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md">
          <div className="text-center space-y-4">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-indigo-600 animate-pulse mx-auto" />
              <div className="absolute inset-0 bg-indigo-200 blur-xl opacity-50 animate-ping rounded-full" />
            </div>
            <p className="text-lg font-bold text-indigo-900">Gemini 正在规划中...</p>
            <p className="text-slate-500 text-sm">正在将您的目标分解为可执行的步骤。</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
