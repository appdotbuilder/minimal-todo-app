import { Progress } from '@/components/ui/progress';

interface TodoStatsProps {
  completedCount: number;
  totalCount: number;
}

export function TodoStats({ completedCount, totalCount }: TodoStatsProps) {
  if (totalCount === 0) return null;

  const progressPercentage = Math.round((completedCount / totalCount) * 100);
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progress
        </span>
        <span className="text-sm text-gray-500">
          {completedCount} of {totalCount} completed
        </span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-2"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{progressPercentage}% complete</span>
        {progressPercentage === 100 && (
          <span className="text-green-600 font-medium">🎉 All done!</span>
        )}
      </div>
    </div>
  );
}