
export enum Priority {
  LOW = '低',
  MEDIUM = '中',
  HIGH = '高'
}

export enum Category {
  PERSONAL = '个人',
  WORK = '工作',
  SHOPPING = '购物',
  HEALTH = '健康',
  FINANCE = '金融',
  OTHER = '其他'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate: string;
  createdAt: number;
  subTasks: { id: string; text: string; completed: boolean }[];
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  priorityBreakdown: Record<Priority, number>;
  categoryBreakdown: Record<Category, number>;
}
