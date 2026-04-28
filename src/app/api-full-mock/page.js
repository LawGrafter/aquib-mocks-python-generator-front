"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { 
  FileSpreadsheet, 
  Download, 
  Loader2, 
  AlertCircle, 
  Play, 
  Edit3, 
  Save,
  CheckCircle,
  BarChart3,
  ShieldCheck,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { generateFullTest, fetchCsvContent, validateQuestionsWithAI } from "@/utils/api";
import Papa from "papaparse";

export default function ApiFullMock() {
  const [difficulty, setDifficulty] = useState("moderate");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [csvData, setCsvData] = useState([]); // Array of objects or arrays
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCsvData([]);
    setCsvHeaders([]);
    setProgressMessage("Initializing exam generation...");
    setEstimatedTime(300); // 5 minutes estimate

    // Simulate progress updates
    const progressSteps = [
      { time: 2000, message: "Generating questions for Indian National Movement, Ancient History..." },
      { time: 8000, message: "Generating questions for Geography, Polity, Science..." },
      { time: 15000, message: "Generating questions for English, Hindi, Computers..." },
      { time: 25000, message: "Generating questions for Current Affairs, Reasoning..." },
      { time: 40000, message: "Running deduplication checks..." },
      { time: 60000, message: "Ensuring 100 unique questions..." },
      { time: 90000, message: "Finalizing exam paper..." },
    ];

    const progressTimers = progressSteps.map(({ time, message }) =>
      setTimeout(() => setProgressMessage(message), time)
    );

    // Countdown timer
    const startTime = Date.now();
    const countdownInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, 300 - elapsed);
      setEstimatedTime(remaining);
    }, 1000);

    try {
      // 1. Generate the test
      const data = await generateFullTest(difficulty);
      
      // Clear all timers
      progressTimers.forEach(timer => clearTimeout(timer));
      clearInterval(countdownInterval);
      
      setProgressMessage("Loading preview...");
      setResult(data);

      // 2. Fetch the CSV content for preview
      if (data.csv_url) {
        const csvText = await fetchCsvContent(data.csv_url);
        
        // 3. Parse CSV
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setCsvHeaders(results.meta.fields || []);
            setCsvData(results.data);
          },
          error: (err) => {
            console.error("CSV Parse Error:", err);
            setError("Failed to parse CSV content for preview.");
          }
        });
      }
    } catch (err) {
      setError("Failed to generate mock test. Please check the backend connection.");
      console.error(err);
    } finally {
      setIsLoading(false);
      setProgressMessage("");
      setEstimatedTime(0);
    }
  };

  const handleCellChange = (rowIndex, column, value) => {
    const newData = [...csvData];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    setCsvData(newData);
  };

  const handleDownloadEdited = () => {
    if (csvData.length === 0) return;

    // Unparse back to CSV string
    const csvString = Papa.unparse(csvData);
    
    // Create Blob and download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `edited_mock_test_${difficulty}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleValidateWithAI = async () => {
    if (csvData.length === 0) return;
    
    setIsValidating(true);
    setError(null);
    
    try {
      const results = await validateQuestionsWithAI(csvData);
      setValidationResults(results);
      setShowValidation(true);
    } catch (err) {
      setError("Failed to validate questions. Please try again.");
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            APS/PS Full Mock Generator 
            <span className="ml-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 p-2 rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
          </h2>
        </div>

        {/* Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-1/3">
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20 focus:border-brand-500 dark:focus:border-brand-400 text-gray-800 dark:text-gray-100 transition-all cursor-pointer"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="easy-to-moderate">Easy to Moderate</option>
              </select>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center space-x-2
                ${isLoading 
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed shadow-none" 
                  : "bg-gradient-to-r from-brand-600 to-brand-700 hover:shadow-xl hover:scale-[1.02]"
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Generate Test</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 flex items-center p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-800 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {isLoading && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="p-6 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800">
                <div className="flex items-start space-x-3 mb-4">
                  <Loader2 className="w-5 h-5 text-brand-600 dark:text-brand-400 animate-spin flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-brand-900 dark:text-brand-100 mb-1">Generation in Progress</h4>
                    <p className="text-sm text-brand-700 dark:text-brand-300">{progressMessage}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-brand-600 dark:text-brand-400 font-medium">
                    <span>Progress</span>
                    <span>Est. {Math.floor(estimatedTime / 60)}:{String(estimatedTime % 60).padStart(2, '0')} remaining</span>
                  </div>
                  <div className="w-full bg-brand-200 dark:bg-brand-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, ((300 - estimatedTime) / 300) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-brand-100 dark:border-brand-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-800 dark:text-gray-200">What's happening:</strong> Generating 100 unique questions across 18 subjects using AI, then deduplicating and validating each question. This typically takes 3-5 minutes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors">
                <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">Total Generated</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{result.total_generated}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors">
                <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">Unique Count</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{result.final_unique_count}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">Top Category</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
                    {Object.entries(result.breakdown || {}).sort((a,b) => b[1] - a[1])[0]?.[0] || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown Chart (Simple List for now) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-colors">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-gray-400" />
                Topic Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(result.breakdown || {}).map(([key, value]) => (
                  <div key={key} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase truncate mb-1">{key}</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Preview & Edit */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[600px] transition-colors">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/50">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">Live Preview & Edit</h3>
                  <span className="text-xs px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full font-medium">
                    {csvData.length} Rows
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleValidateWithAI}
                    disabled={isValidating}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center ${
                      isValidating 
                        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" 
                        : "bg-brand-600 hover:bg-brand-700 text-white"
                    }`}
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Check with AI
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadEdited}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Download CSV
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-4 w-12 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">#</th>
                      {csvHeaders.map((header) => (
                        <th key={header} className="p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 min-w-[150px]">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {csvData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-brand-50/30 dark:hover:bg-gray-700/30 transition-colors group">
                        <td className="p-4 text-xs text-gray-400 dark:text-gray-500 font-mono border-r border-gray-100 dark:border-gray-700">
                          {rowIndex + 1}
                        </td>
                        {csvHeaders.map((header) => (
                          <td key={`${rowIndex}-${header}`} className="p-0 border-r border-gray-100 dark:border-gray-700 relative">
                            <textarea
                              value={row[header] || ""}
                              onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                              className="w-full h-full min-h-[50px] p-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-brand-500 dark:focus:ring-brand-400 focus:bg-white dark:focus:bg-gray-600 text-sm text-gray-700 dark:text-gray-200 resize-none overflow-hidden"
                              rows={1}
                              style={{ height: '100%' }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation Results Panel */}
            {showValidation && validationResults && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-colors animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
                    AI Validation Results
                  </h3>
                  <button
                    onClick={() => setShowValidation(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                      <div>
                        <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">Correct Questions</p>
                        <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">{validationResults.summary?.correct_questions || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Issues Found</p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{validationResults.summary?.questions_with_issues || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                    <div className="flex items-center space-x-3">
                      <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">Duplicates</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{validationResults.summary?.duplicate_count || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Duplicates Section */}
                {validationResults.duplicates && validationResults.duplicates.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                      <XCircle className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                      Duplicate Questions Found
                    </h4>
                    <div className="space-y-3">
                      {validationResults.duplicates.map((dup, idx) => (
                        <div key={idx} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-red-700 dark:text-red-300">
                              Questions #{dup.question_index_1} and #{dup.question_index_2}
                            </span>
                            <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-full">
                              {dup.similarity}% similar
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Q{dup.question_index_1}: {dup.question_1}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Q{dup.question_index_2}: {dup.question_2}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Validation Results */}
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Question-by-Question Analysis</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {validationResults.validated_questions?.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-lg border ${
                          item.has_issues 
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800' 
                            : 'bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-800'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {item.has_issues ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                              Question #{item.question_number}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.confidence === 'high' 
                              ? 'bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300'
                              : item.confidence === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {item.confidence} confidence
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{item.question}</p>
                        
                        {item.issues && item.issues.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Issues:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {item.issues.map((issue, i) => (
                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400">{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {item.suggestions && item.suggestions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Suggestions:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {item.suggestions.map((suggestion, i) => (
                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400">{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </AppLayout>
  );
}