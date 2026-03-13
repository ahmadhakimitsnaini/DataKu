import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const simulateUpload = (name: string) => {
    setUploadedFile(name);
    // Simulate upload delay before redirecting
    setTimeout(() => {
      // Assuming a new project ID is generated, e.g., "123"
      navigate("/project/123");
      onClose();
    }, 1500);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) {
      simulateUpload(file.name);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.name.endsWith(".csv")) {
      simulateUpload(file.name);
    }
  }, []);

  const resetUpload = () => {
    setUploadedFile(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && resetUpload()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass rounded-2xl p-8 w-full max-w-lg"
          >
            <h2 className="text-xl font-bold mb-1">New Project</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Upload a CSV dataset to get started
            </p>

            {!uploadedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
                onClick={() => document.getElementById("csv-input")?.click()}
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium mb-1">Drag & drop your CSV file here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
                <input
                  id="csv-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-3 bg-secondary rounded-lg p-4">
                  <FileSpreadsheet className="w-8 h-8 text-primary shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadedFile}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploading and profiling dataset...
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Close button if needed */}
            <div className="mt-6 text-right">
              <Button variant="ghost" onClick={resetUpload}>Cancel</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
