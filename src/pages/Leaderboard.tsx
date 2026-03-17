import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Brain, Trophy, Activity, ExternalLink, RefreshCw, CheckCircle2, Terminal, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { authHeaders, getToken } from "@/lib/auth";

interface Model {
  id: number;
  project_id: string;
  algorithm_name: string;
  accuracy_score: number | null;
  f1_score: number | null;
  training_time_seconds: number | null;
  is_deployed: number;
}

export default function Leaderboard() {
  const { id } = useParams();
  const [models, setModels] = useState<Model[]>([]);
  const [isTraining, setIsTraining] = useState(true);
  const [deployingId, setDeployingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deployedModel, setDeployedModel] = useState<Model | null>(null);
  
  const fetchLeaderboard = async () => {
    try {
      // 1. Check Project Status
      const projRes = await fetch(api.projects.get(id!), { headers: authHeaders() });
      if (projRes.ok) {
        const project = await projRes.json();
        setIsTraining(project.status === "training");
      }
      const modRes = await fetch(api.jobs.models(id!), { headers: authHeaders() });
      if (modRes.ok) {
        const data = await modRes.json();
        setModels(data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // Poll every 3 seconds if still training
    let intervalId: NodeJS.Timeout;
    if (isTraining) {
      intervalId = setInterval(fetchLeaderboard, 3000);
    }
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isTraining]);

  // Sort models by accuracy desc
  const sortedModels = [...models].sort((a, b) => (b.accuracy_score || 0) - (a.accuracy_score || 0));
  const bestModel = sortedModels.length > 0 ? sortedModels[0] : null;

  useEffect(() => {
    const active = models.find(m => m.is_deployed === 1);
    if (active) setDeployedModel(active);
  }, [models]);

  const handleDeploy = async (modelId: number) => {
    setDeployingId(modelId);
    try {
      const res = await fetch(api.jobs.deploy(id!, modelId), {
        method: "PUT",
        headers: authHeaders()
      });
      if (!res.ok) throw new Error("Failed to deploy model");
      
      toast.success("Model deployed successfully!");
      await fetchLeaderboard();
      setShowModal(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to deploy model");
    } finally {
      setDeployingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-tight">DataKu</span>
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
              {isTraining ? (
                <>
                  <Activity className="w-4 h-4 animate-pulse text-warning" /> 
                  <span className="text-warning">Training in progress...</span>
                </>
              ) : (
                <>
                   <CheckCircle2 className="w-4 h-4 text-green-500" />
                   <span className="text-green-500">Training Completed</span>
                </>
              )}
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={fetchLeaderboard}>
            <RefreshCw className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {sortedModels.length === 0 && isTraining && (
            <div className="glass rounded-xl p-12 text-center flex flex-col items-center justify-center">
               <Activity className="w-12 h-12 text-primary animate-pulse mb-4" />
               <h3 className="text-xl font-semibold mb-2">AutoML Engine is Starting</h3>
               <p className="text-muted-foreground">The data is being preprocessed and models will appear here soon...</p>
            </div>
          )}

          {sortedModels.map((model, index) => {
            const isBest = model.id === bestModel?.id && !isTraining;
            
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
                        <h3 className="font-semibold text-lg">{model.algorithm_name}</h3>
                        {isBest && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                            <Trophy className="w-3 h-3" /> Best Model
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">ID: {model.id} • Time: {model.training_time_seconds}s</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12 text-right">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                      <div className="text-xl font-mono font-bold text-primary">{model.accuracy_score}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">F1 Score</div>
                      <div className="text-xl font-mono font-bold text-primary">{model.f1_score}%</div>
                    </div>
                    <div className="min-w-[140px]">
                        {model.is_deployed === 1 ? (
                          <Button 
                            size="sm" 
                            className="w-full gap-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/50" 
                            onClick={() => setShowModal(true)}
                          >
                            <CheckCircle2 className="w-4 h-4" /> Deployed
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="w-full gap-2" 
                            variant={isBest ? "default" : "secondary"}
                            disabled={deployingId === model.id}
                            onClick={() => handleDeploy(model.id)}
                          >
                            {deployingId === model.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <ExternalLink className="w-4 h-4" />
                            )}
                            {deployingId === model.id ? "Deploying..." : "Deploy API"}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Deployment Modal */}
      {showModal && deployedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-primary/20">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">API Integration</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <p className="text-muted-foreground mb-6">
                Your model <strong>{deployedModel.algorithm_name}</strong> is now live. Use the endpoint below to make predictions.
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">cURL</h3>
                    <button 
                      onClick={() => copyToClipboard(`curl -X POST http://localhost:8000/api/predict/${id} \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer ${getToken()}" \\
-d '{"feature1": 2.5, "feature2": "category_a"}'`)}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <pre className="bg-secondary/50 p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto border border-border">
<span className="text-blue-400">curl</span> -X POST http://localhost:8000/api/predict/{id} \
  -H <span className="text-green-400">"Content-Type: application/json"</span> \
  -H <span className="text-green-400">"Authorization: Bearer {getToken()}"</span> \
  -d <span className="text-yellow-400">'{'{"feature1": 2.5, "feature2": "category_a"}'}'</span>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Python (requests)</h3>
                    <button 
                      onClick={() => copyToClipboard(`import requests

url = "http://localhost:8000/api/predict/${id}"
headers = {
    "Authorization": "Bearer ${getToken()}",
    "Content-Type": "application/json"
}
data = {
    "feature1": 2.5,
    "feature2": "category_a"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`)}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <pre className="bg-secondary/50 p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto border border-border">
<span className="text-blue-400">import</span> requests

url = <span className="text-green-400">"http://localhost:8000/api/predict/{id}"</span>
headers = {'{'}
    <span className="text-green-400">"Authorization"</span>: <span className="text-green-400">"Bearer {getToken()}"</span>,
    <span className="text-green-400">"Content-Type"</span>: <span className="text-green-400">"application/json"</span>
{'}'}
data = {'{'}
    <span className="text-green-400">"feature1"</span>: <span className="text-orange-400">2.5</span>,
    <span className="text-green-400">"feature2"</span>: <span className="text-green-400">"category_a"</span>
{'}'}

response = requests.post(url, json=data, headers=headers)
<span className="text-blue-400">print</span>(response.json())
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border bg-secondary/30 flex justify-end">
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
