import { useState, useCallback } from "react";
import { Upload, Camera } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  onUpload: (file: File) => void;
  label?: string;
}

const UploadZone = ({ onUpload, label = "Upload your photo" }: Props) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload(file);
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <motion.label
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative flex flex-col items-center justify-center w-full aspect-square max-w-sm mx-auto rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
        dragOver
          ? "border-primary bg-accent"
          : "border-border hover:border-primary/50 hover:bg-accent/50"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {preview ? (
        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
      ) : (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
            <Camera className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground mt-1">Drag & drop or click to browse</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Upload className="w-3 h-3" />
            JPG, PNG up to 10MB
          </div>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </motion.label>
  );
};

export default UploadZone;
