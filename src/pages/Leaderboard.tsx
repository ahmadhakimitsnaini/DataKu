import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Brain, Trophy, Activity, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Model {
  id: string;
  algorithm: string;
  accuracy: number;
  f1_score: number;
  training_time: string;
  status: "training" | "completed";
}

const mockModels: Model[] = [
  { id: "m1", algorithm: "Random Forest", accuracy: 94.2, f1_score: 93.8, training_time: "45s", status: "completed" },
  { id: "m2", algorithm: "XGBoost", accuracy: 96.1, f1_score: 95.5, training_time: "52s", status: "completed" },
  { id: "m3", algorithm: "LightGBM", accuracy: 0, f1_score: 0, training_time: "-", status: "training" },
];

export default function Leaderboard() {
  const { id } = useParams();
  const [models, setModels] = useState<Model[]>(mockModels);
  
  // Sort models by accuracy desc
  const sortedModels = [...models].sort((a, b) => b.accuracy - a.accuracy);
  const bestModel = sortedModels.find(m => m.status === "completed");

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-tight">AutoML</span>
        </Link>
        <Link to="/dashboard">
          <Button variant="ghost">Back to Dashboard</Button>
        </Link>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Model Leaderboard</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" /> Training in progress...
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {sortedModels.map((model, index) => {
            const isBest = model.id === bestModel?.id;
            
            return (
              <div 
                key={model.id}
                className={`glass rounded-xl p-6 transition-colors ${
                  isBest ? "border-primary/50 bg-primary/5" : "hover:border-primary/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-lg">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{model.algorithm}</h3>
                        {isBest && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                            <Trophy className="w-3 h-3" /> Best Model
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">ID: {model.id} • Time: {model.training_time}</p>
                    </div>
                  </div>
                  
                  {model.status === "completed" ? (
                    <div className="flex items-center gap-12 text-right">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                        <div className="text-xl font-mono font-bold text-primary">{model.accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">F1 Score</div>
                        <div className="text-xl font-mono font-bold text-primary">{model.f1_score}%</div>
                      </div>
                      <div className="min-w-[140px]">
                         <Button size="sm" className="w-full gap-2" variant={isBest ? "default" : "secondary"}>
                           <ExternalLink className="w-4 h-4" /> Deploy API
                         </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 max-w-md ml-12">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Training...</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary/50 animate-pulse w-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
