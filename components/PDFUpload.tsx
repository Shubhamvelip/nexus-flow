'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  onTitleChange: (title: string) => void;
  fileName?: string;
  title?: string;
  isProcessing?: boolean;
}

export function PDFUpload({
  onFileSelect,
  onTitleChange,
  fileName,
  title = '',
  isProcessing = false,
}: PDFUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        animate={{
          borderColor: dragActive ? '#48d1cc' : undefined,
          backgroundColor: dragActive ? '#48d1cc10' : undefined,
        }}
        transition={{ duration: 0.2 }}
        className={`relative border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition-all ${
          dragActive ? 'border-primary bg-primary/5' : ''
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          disabled={isProcessing}
        />

        {fileName ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-foreground">
              <span className="font-medium">{fileName}</span>
              <span className="text-muted-foreground">uploaded</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to process. Click to change file.
            </p>
          </div>
        ) : (
          <motion.div
            animate={isProcessing ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="space-y-3"
          >
            <div className="flex justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="w-12 h-12 text-primary" />
              </motion.div>
            </div>
            <div>
              <p className="text-foreground font-medium">
                Drag and drop your PDF here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to select a file
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Title Input */}
      <Card className="p-4 bg-card border-border">
        <label className="block text-sm font-medium text-foreground mb-2">
          Policy Title
        </label>
        <Input
          type="text"
          placeholder="Enter policy title (auto-filled after processing)"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={isProcessing}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </Card>

      {/* Clear Button */}
      <Button
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.value = '';
            onFileSelect(new File([], ''));
          }
        }}
        variant="outline"
        className="w-full border-border text-foreground hover:bg-muted"
        disabled={!fileName || isProcessing}
      >
        <X className="w-4 h-4 mr-2" />
        Clear
      </Button>
    </div>
  );
}
