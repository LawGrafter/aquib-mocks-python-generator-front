"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { 
  Trophy,
  Download, 
  Loader2, 
  AlertCircle, 
  Play, 
  Save,
  CheckCircle,
  BarChart3,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Target,
  Upload,
  FileText,
  Trash2
} from "lucide-react";
import { generateAHCChallenge, fetchCsvContent, validateQuestionsWithAI } from "@/utils/api";
import Papa from "papaparse";

export default function AHCChallenge() {
  const [difficulty, setDifficulty] = useState("moderate");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [progressMessage, setProgressMessage] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [previousCsvFiles, setPreviousCsvFiles] = useState([]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCsvData([]);
    setCsvHeaders([]);
    setValidationResults(null);
    setShowValidation(false);
    setProgressMessage("Initializing AHC Challenge 2026 generation...");
    setEstimatedTime(420); // 7 minutes estimate for 100 questions

    // Simulate progress updates
    const progressSteps = [
      { time: 3000, message: "Generating English questions (Synonym, Antonym, Grammar)..." },
      { time: 10000, message: "Generating Hindi questions (Vilom, Paryayvachi, Sandhi)..." },
      { time: 20000, message: "Generating Reasoning questions (Series, Syllogism, Coding)..." },
      { time: 35000, message: "Generating Computer questions (Shortcuts, Networking)..." },
      { time: 50000, message: "Generating History questions (Ancient, Medieval, National Movement)..." },
      { time: 70000, message: "Generating Geography questions (Indian & World)..." },
      { time: 90000, message: "Generating Science questions (Physics, Chemistry, Biology)..." },
      { time: 110000, message: "Generating Polity & Economics questions..." },
      { time: 130000, message: "Generating Current Affairs 2025 questions..." },
      { time: 150000, message: "Generating Environment, Agriculture & Census questions..." },
      { time: 170000, message: "Generating Art & Culture questions..." },
      { time: 190000, message: "Finalizing all 100 questions..." },
    ];

    const progressTimers = progressSteps.map(({ time, message }) =>
      setTimeout(() => setProgressMessage(message), time)
    );

    // Countdown timer
    const startTime = Date.now();
    const countdownInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, 420 - elapsed);
      setEstimatedTime(remaining);
    }, 1000);

    try {
      // Generate the test (with optional CSV dedup files)
      const data = await generateAHCChallenge(difficulty, previousCsvFiles);
      
      // Clear all timers
      progressTimers.forEach(timer => clearTimeout(timer));
      clearInterval(countdownInterval);
      
      setProgressMessage("Loading preview...");
      setResult(data);

      // Fetch the CSV content for preview
      if (data.csv_url) {
        const csvText = await fetchCsvContent(data.csv_url);
        
        // Parse CSV
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
      setError("Failed to generate AHC Challenge. Please check the backend connection.");
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

  const handleDownloadCSV = () => {
    if (csvData.length === 0) return;

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ahc_challenge_2026_${difficulty}_${new Date().getTime()}.csv`);
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
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              AHC Challenge 2026
              <span className="ml-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-2 rounded-lg">
                <Trophy className="w-6 h-6" />
              </span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Allahabad High Court Challenge - 100 Questions with Exact Syllabus Breakdown
            </p>
          </div>
        </div>

        {/* Syllabus Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800 p-6">
          <div className="flex items-start space-x-4">
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Exam Pattern</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">English</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">10 Qs</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Hindi</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">7 Qs</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Reasoning</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">12 Qs</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Computer</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">10 Qs</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">History</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">14 Qs</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Geography</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">10 Qs</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Science</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">8 Qs</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Others</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">29 Qs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Previous CSVs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-colors duration-300">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-500" />
            Upload Previous Question CSVs (Optional)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Upload your previously generated CSVs so the system can avoid generating duplicate questions.
          </p>

          <div className="flex flex-col gap-4">
            <label
              className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
            >
              <input
                type="file"
                accept=".csv"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setPreviousCsvFiles((prev) => [...prev, ...files]);
                  e.target.value = "";
                }}
              />
              <div className="text-center">
                <FileText className="w-6 h-6 mx-auto text-gray-400 dark:text-gray-500 mb-1" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Click to select CSV files</span>
              </div>
            </label>

            {previousCsvFiles.length > 0 && (
              <div className="space-y-2">
                {previousCsvFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileText className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                      <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => setPreviousCsvFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 dark:hover:text-red-300 flex-shrink-0 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setPreviousCsvFiles([])}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  Remove all
                </button>
              </div>
            )}
          </div>
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
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/20 focus:border-yellow-500 dark:focus:border-yellow-400 text-gray-800 dark:text-gray-100 transition-all cursor-pointer"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center space-x-2
                ${isLoading 
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed shadow-none" 
                  : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:shadow-xl hover:scale-[1.02]"
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
                  <span>Generate 100 Questions</span>
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
              <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
                <div className="flex items-start space-x-3 mb-4">
                  <Loader2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-spin flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Generation in Progress</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{progressMessage}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    <span>Progress</span>
                    <span>Est. {Math.floor(estimatedTime / 60)}:{String(estimatedTime % 60).padStart(2, '0')} remaining</span>
                  </div>
                  <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, ((420 - estimatedTime) / 420) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-100 dark:border-yellow-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-800 dark:text-gray-200">What's happening:</strong> Generating 100 questions across 19 subjects with exact syllabus breakdown. Each subject has specific question types (e.g., Synonym, Antonym, Syllogism, etc.). This typically takes 5-7 minutes.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{result.final_count} / 100</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">Difficulty</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 capitalize">{difficulty}</p>
                </div>
              </div>

              {result.duplicates_removed > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-orange-200 dark:border-orange-800 flex items-center space-x-4 transition-colors md:col-span-2">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">Duplicates Removed</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{result.duplicates_removed} removed &amp; replaced</p>
                  </div>
                </div>
              )}
            </div>

            {/* Subject Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-colors">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-gray-400" />
                Subject-wise Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">Live Preview & Edit</h3>
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                    {csvData.length} Questions
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleValidateWithAI}
                    disabled={isValidating}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center ${
                      isValidating 
                        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
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
                    onClick={handleDownloadCSV}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center"
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
                      <tr key={rowIndex} className="hover:bg-yellow-50/30 dark:hover:bg-gray-700/30 transition-colors group">
                        <td className="p-4 text-xs text-gray-400 dark:text-gray-500 font-mono border-r border-gray-100 dark:border-gray-700">
                          {rowIndex + 1}
                        </td>
                        {csvHeaders.map((header) => (
                          <td key={`${rowIndex}-${header}`} className="p-0 border-r border-gray-100 dark:border-gray-700 relative">
                            <textarea
                              value={row[header] || ""}
                              onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                              className="w-full h-full min-h-[50px] p-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:bg-white dark:focus:bg-gray-600 text-sm text-gray-700 dark:text-gray-200 resize-none overflow-hidden"
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
                    <ShieldCheck className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
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
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Correct Questions</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{validationResults.summary?.correct_questions || 0}</p>
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
                    <div className="space-y-3 max-h-64 overflow-y-auto">
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
                    {validationResults.validated_questions?.slice(0, 20).map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-lg border ${
                          item.has_issues 
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800' 
                            : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {item.has_issues ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                              Question #{item.question_number}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.confidence === 'high' 
                              ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
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
                    {validationResults.validated_questions?.length > 20 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                        Showing first 20 of {validationResults.validated_questions.length} validated questions
                      </p>
                    )}
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
