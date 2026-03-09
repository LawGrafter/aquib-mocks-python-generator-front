"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Upload, FileText, X, Loader2, Download, AlertCircle } from "lucide-react";
import { createContent } from "@/utils/api";

export default function ContentMaker() {
  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Filter for PDFs only
      const pdfFiles = newFiles.filter(file => file.type === "application/pdf");
      
      if (pdfFiles.length !== newFiles.length) {
        setError("Only PDF files are allowed.");
      } else {
        setError(null);
      }
      
      setFiles((prev) => [...prev, ...pdfFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await createContent(files, topic);
      setResult(data);
    } catch (err) {
      setError("Failed to generate content. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            Content Maker <span className="ml-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg"><FileText className="w-6 h-6" /></span>
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Topic Input */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic (Optional)
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Revolt of 1857 Modern History"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
              />
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload PDF Files
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 md:p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50/50 dark:bg-gray-700/50 group cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center space-y-3 pointer-events-none">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF files only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Selected Files</p>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-800">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || files.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center space-x-2
                ${isLoading || files.length === 0
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl hover:scale-[1.01]"
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result Area */}
        {result && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 p-6 md:p-8 flex flex-col items-center text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm text-green-600 dark:text-green-400 mb-2">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300">Content Generated Successfully!</h3>
            <p className="text-green-700 dark:text-green-400 max-w-md">
              Your content has been processed and is ready for download.
            </p>
            <a
              href={result.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-200 dark:shadow-green-900/20 transition-all flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </a>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
