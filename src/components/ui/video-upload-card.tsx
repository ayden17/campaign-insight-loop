"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Upload, X, Play, Pause } from "lucide-react";

interface VideoUploadCardProps {
  className?: string;
  title?: string;
  description?: string;
  onFileSelect?: (file: File) => void;
}

export function VideoUploadCard({
  className,
  title = "Upload Your Creative",
  description = "Drop in your videos or images to get started.",
  onFileSelect,
}: VideoUploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processFile = useCallback((file: File) => {
    setUploadedFile(file);
    if (file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
    onFileSelect?.(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleRemove = useCallback(() => {
    setUploadedFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setIsPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
    else { videoRef.current.play(); setIsPlaying(true); }
  };

  return (
    <div className={cn("w-full", className)}>
      {uploadedFile ? (
        <div className="relative rounded-xl border border-border bg-card overflow-hidden">
          <button onClick={handleRemove} className="absolute top-2 right-2 z-10 rounded-full bg-background/80 p-1.5 hover:bg-background transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          {videoUrl ? (
            <div className="relative aspect-video">
              <video ref={videoRef} src={videoUrl} className="w-full h-full object-cover" onEnded={() => setIsPlaying(false)} />
              <button onClick={togglePlay} className="absolute bottom-3 left-3 rounded-full bg-background/80 p-2 hover:bg-background transition-colors">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center bg-muted">
              <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
            </div>
          )}
          <div className="p-3 border-t border-border">
            <p className="text-xs text-muted-foreground truncate">{uploadedFile.name}</p>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
          )}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-card-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
