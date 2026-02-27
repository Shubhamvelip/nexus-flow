'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploadPanelProps {
  onFileSelect: (file: File, title: string) => void;
  isProcessing?: boolean;
}

export function FileUploadPanel({
  onFileSelect,
  isProcessing = false,
}: FileUploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [policyTitle, setPolicyTitle] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && policyTitle) {
      onFileSelect(selectedFile, policyTitle);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPolicyTitle('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Policy Title Input */}
      <Card className="p-4 bg-card border-border">
        <Label htmlFor="title" className="text-sm font-medium text-foreground">
          Policy Title
        </Label>
        <Input
          id="title"
          placeholder="e.g., Smart Zoning Policy"
          value={policyTitle}
          onChange={(e) => setPolicyTitle(e.target.value)}
          disabled={isProcessing}
          className="mt-2 bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </Card>

      {/* File Upload Area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        animate={isDragActive ? { scale: 0.98 } : { scale: 1 }}
        className={`flex-1 rounded-lg border-2 border-dashed transition-all ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30'
        }`}
      >
        <label className="flex items-center justify-center w-full h-full cursor-pointer">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isProcessing}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2 p-6">
              <File className="w-8 h-8 text-primary" />
              <p className="font-medium text-foreground text-center">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
              </motion.div>
              <p className="font-medium text-foreground">
                Drag PDF here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported format: PDF
              </p>
            </div>
          )}
        </label>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {selectedFile && (
          <Button
            onClick={clearFile}
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-muted"
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !policyTitle || isProcessing}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isProcessing ? 'Processing...' : 'Process PDF'}
        </Button>
      </div>
    </div>
  );
}
