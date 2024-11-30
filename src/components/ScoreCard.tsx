import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { BalanceScore } from "@/types/balance";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  score: BalanceScore;
  className?: string;
}

/**
 * 展示平衡分析得分的卡片组件
 */
export function ScoreCard({ score, className }: ScoreCardProps) {
  // 根据分数获取颜色
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // 获取进度条颜色
  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>平衡分析得分</span>
          <span className={cn("text-2xl font-bold", getScoreColor(score.total))}>
            {Math.round(score.total)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>几何平衡</span>
            <span className={getScoreColor(score.details.geometry)}>
              {Math.round(score.details.geometry)}
            </span>
          </div>
          <Progress 
            value={score.details.geometry} 
            className={cn("h-2", getProgressColor(score.details.geometry))} 
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>流动平衡</span>
            <span className={getScoreColor(score.details.flow)}>
              {Math.round(score.details.flow)}
            </span>
          </div>
          <Progress 
            value={score.details.flow} 
            className={cn("h-2", getProgressColor(score.details.flow))} 
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>分布平衡</span>
            <span className={getScoreColor(score.details.distribution)}>
              {Math.round(score.details.distribution)}
            </span>
          </div>
          <Progress 
            value={score.details.distribution} 
            className={cn("h-2", getProgressColor(score.details.distribution))} 
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>体积利用</span>
            <span className={getScoreColor(score.details.volume)}>
              {Math.round(score.details.volume)}
            </span>
          </div>
          <Progress 
            value={score.details.volume} 
            className={cn("h-2", getProgressColor(score.details.volume))} 
          />
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          置信度: {Math.round(score.confidence * 100)}%
        </div>
      </CardContent>
    </Card>
  );
}
