import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { TodoForm } from '@/components/TodoForm';
import { TodoItem } from '@/components/TodoItem';
import { TodoStats } from '@/components/TodoStats';
import { EmptyState } from '@/components/EmptyState';
import { AlertCircle } from 'lucide-react';
import type { Todo, CreateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load todos from the server
  const loadTodos = useCallback(async () => {
    try {
      setError(null);
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
      setError('Failed to load todos. Please refresh the page.');
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Create a new todo
  const handleCreateTodo = async (input: CreateTodoInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTodo = await trpc.createTodo.mutate(input);
      setTodos((prev: Todo[]) => [newTodo, ...prev]);
    } catch (error) {
      console.error('Failed to create todo:', error);
      setError('Failed to create todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle todo completion
  const handleToggleTodo = async (id: number, completed: boolean) => {
    // Optimistic update
    setTodos((prev: Todo[]) =>
      prev.map((todo: Todo) =>
        todo.id === id ? { ...todo, completed } : todo
      )
    );

    try {
      await trpc.updateTodo.mutate({ id, completed });
    } catch (error) {
      console.error('Failed to update todo:', error);
      // Revert optimistic update
      setTodos((prev: Todo[]) =>
        prev.map((todo: Todo) =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      );
      setError('Failed to update todo. Please try again.');
    }
  };

  // Delete a todo
  const handleDeleteTodo = async (id: number) => {
    try {
      await trpc.deleteTodo.mutate({ id });
      setTodos((prev: Todo[]) => prev.filter((todo: Todo) => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
      setError('Failed to delete todo. Please try again.');
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ✅ TodoMaster
          </h1>
          <p className="text-gray-600 mb-4">Transform tasks into achievements</p>
        </div>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress indicator */}
        <TodoStats completedCount={completedCount} totalCount={totalCount} />

        {/* Add new todo form */}
        <TodoForm onSubmit={handleCreateTodo} isLoading={isLoading} />

        {/* Todo list */}
        <div className="space-y-2">
          {todos.length === 0 ? (
            <EmptyState />
          ) : (
            todos.map((todo: Todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {totalCount > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {completedCount === totalCount && totalCount > 0
                ? "🎉 Amazing work! All tasks completed!"
                : completedCount > 0
                ? `Keep it up! ${totalCount - completedCount} more to go 💪`
                : "Ready to tackle your tasks? Let's go! 🚀"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;