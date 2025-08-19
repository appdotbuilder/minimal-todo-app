import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { CreateTodoInput } from '../../../server/src/schema';

interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => Promise<void>;
  isLoading?: boolean;
}

export function TodoForm({ onSubmit, isLoading = false }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and after successful submission
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    await onSubmit({ title: title.trim() });
    setTitle('');
    
    // Refocus input after submission
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Add a new task... (Press Enter to add)"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            className="flex-1 todo-input"
            disabled={isLoading}
            maxLength={255}
            autoComplete="off"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !title.trim()}
            className="px-4 transition-all duration-200 min-w-[80px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}