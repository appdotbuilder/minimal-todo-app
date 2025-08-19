import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Check } from 'lucide-react';
import { useState } from 'react';
import type { Todo } from '../../../server/src/schema';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  return (
    <Card className={`shadow-sm hover:shadow-md transition-all duration-200 todo-card slide-in ${
      todo.completed ? 'bg-green-50 border-green-200' : 'bg-white'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked: boolean) => onToggle(todo.id, checked)}
              className="todo-checkbox"
            />
            {todo.completed && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`${
                todo.completed
                  ? 'line-through text-gray-500'
                  : 'text-gray-900'
              } transition-all duration-300 todo-item break-words ${
                todo.completed ? 'font-normal' : 'font-medium'
              }`}
            >
              {todo.title}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {todo.completed ? '✓ Completed' : 'In progress'} • Created {todo.created_at.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 shrink-0"
            aria-label={`Delete task: ${todo.title}`}
          >
            {isDeleting ? (
              <div className="h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}