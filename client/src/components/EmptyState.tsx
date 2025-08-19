import { Card, CardContent } from '@/components/ui/card';

export function EmptyState() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tasks yet
        </h3>
        <p className="text-gray-500 mb-4">
          Add your first task above to get started on your productivity journey!
        </p>
        <div className="text-sm text-gray-400">
          💡 Tip: Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to quickly add a task
        </div>
      </CardContent>
    </Card>
  );
}