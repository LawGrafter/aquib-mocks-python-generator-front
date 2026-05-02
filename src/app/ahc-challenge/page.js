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
  Trash2,
  Pencil,
  X,
  Sparkles,
  Send
} from "lucide-react";
import { generateAHCChallenge, generateAHCCustom, fetchCsvContent, validateQuestionsWithAI, aiEditQuestion } from "@/utils/api";
import Papa from "papaparse";

const ALL_SUBJECTS = [
  "English", "Hindi", "Reasoning", "Computer", "Economics", "Environment",
  "Polity", "Indian National Movement", "Ancient History", "Medieval History",
  "Chemistry", "Biology", "Physics", "World Geography", "Indian Geography",
  "Agriculture", "Census", "Current Affairs 2025", "Art & Culture", "UP GK"
];

export default function AHCChallenge() {
  const [mode, setMode] = useState("default"); // "default" or "custom"
  const [difficulty, setDifficulty] = useState("moderate");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(20);
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

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiEditing, setIsAiEditing] = useState(false);

  const openEditModal = (rowIndex) => {
    const row = csvData[rowIndex];
    setEditRowIndex(rowIndex);
    setEditForm({ ...row });
    setAiPrompt("");
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    const newData = [...csvData];
    newData[editRowIndex] = { ...editForm };
    setCsvData(newData);
    setEditModalOpen(false);
  };

  const handleAiEdit = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiEditing(true);
    try {
      const result = await aiEditQuestion({
        question: editForm["Question"] || "",
        option_a: editForm["Option A"] || "",
        option_b: editForm["Option B"] || "",
        option_c: editForm["Option C"] || "",
        option_d: editForm["Option D"] || "",
        correct_answer: editForm["Correct Answer"] || "",
        prompt: aiPrompt,
        subject: editForm["Subject"] || "",
        topic: editForm["Topic"] || "",
      });
      setEditForm((prev) => ({
        ...prev,
        "Question": result.question,
        "Option A": result.option_a,
        "Option B": result.option_b,
        "Option C": result.option_c,
        "Option D": result.option_d,
        "Correct Answer": result.correct_answer,
      }));
      setAiPrompt("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiEditing(false);
    }
  };

  const handleGenerate = async () => {
    if (mode === "custom" && selectedSubjects.length === 0) {
      setError("Please select at least one subject for custom mode.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCsvData([]);
    setCsvHeaders([]);
    setValidationResults(null);
    setShowValidation(false);

    const isCustom = mode === "custom";
    const qCount = isCustom ? totalQuestions : 100;
    const estSeconds = isCustom ? Math.max(60, Math.ceil(qCount * 4.2)) : 420;

    setProgressMessage(isCustom
      ? `Initializing custom generation (${qCount} questions, ${selectedSubjects.length} subjects)...`
      : "Initializing AHC Challenge 2026 generation..."
    );
    setEstimatedTime(estSeconds);

    // Simulate progress updates
    const progressSteps = isCustom
      ? [
          { time: 3000, message: `Generating questions for ${selectedSubjects.slice(0, 3).join(", ")}...` },
          { time: 15000, message: "Processing question types and formatting..." },
          { time: 30000, message: "Deduplicating and validating..." },
          { time: 50000, message: "Finalizing questions..." },
        ]
      : [
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
      const remaining = Math.max(0, estSeconds - elapsed);
      setEstimatedTime(remaining);
    }, 1000);

    try {
      const data = isCustom
        ? await generateAHCCustom(difficulty, selectedSubjects, totalQuestions, previousCsvFiles)
        : await generateAHCChallenge(difficulty, previousCsvFiles);
      
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
              <span className="ml-3 bg-brand-50 dark:bg-brand/20 text-brand dark:text-brand-light p-2 rounded-lg">
                <Trophy className="w-6 h-6" />
              </span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Allahabad High Court Challenge - 100 Questions with Exact Syllabus Breakdown
            </p>
          </div>
        </div>

        {/* Syllabus Info Card */}
        <div className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand/10 dark:to-brand/5 rounded-2xl shadow-sm border border-brand-100 dark:border-brand-800 p-6">
          <div className="flex items-start space-x-4">
            <Target className="w-8 h-8 text-brand dark:text-brand-light flex-shrink-0 mt-1" />
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
            <Upload className="w-5 h-5 mr-2 text-brand-500" />
            Upload Previous Question CSVs (Optional)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Upload your previously generated CSVs so the system can avoid generating duplicate questions.
          </p>

          <div className="flex flex-col gap-4">
            <label
              className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors"
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-colors duration-300 space-y-6">
          
          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Generation Mode</label>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-full md:w-80">
              <button
                onClick={() => setMode("default")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === "default"
                    ? "bg-brand text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                Default (100 Qs)
              </button>
              <button
                onClick={() => setMode("custom")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === "custom"
                    ? "bg-brand text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Custom Mode Options */}
          {mode === "custom" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-100 dark:border-gray-700 pt-5">
              
              {/* Subject Multi-Select */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Subjects
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSubjects([...ALL_SUBJECTS])}
                      className="text-xs text-brand hover:text-brand-dark font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                      onClick={() => setSelectedSubjects([])}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ALL_SUBJECTS.map((subj) => {
                    const isSelected = selectedSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        onClick={() => {
                          setSelectedSubjects((prev) =>
                            isSelected ? prev.filter((s) => s !== subj) : [...prev, subj]
                          );
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 text-left ${
                          isSelected
                            ? "bg-brand-50 dark:bg-brand/20 border-brand text-brand dark:text-brand-light"
                            : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-brand/50"
                        }`}
                      >
                        {subj}
                      </button>
                    );
                  })}
                </div>
                {selectedSubjects.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              {/* Total Questions */}
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Questions
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-800 dark:text-gray-100 transition-all"
                />
              </div>
            </div>
          )}

          {/* Difficulty + Generate Button */}
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-1/3">
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 dark:focus:ring-brand-light/20 focus:border-brand dark:focus:border-brand-light text-gray-800 dark:text-gray-100 transition-all cursor-pointer"
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
                  : "bg-gradient-to-r from-brand to-brand-light hover:shadow-xl hover:scale-[1.02]"
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
                  <span>{mode === "custom" ? `Generate ${totalQuestions} Questions` : "Generate 100 Questions"}</span>
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
              <div className="p-6 bg-brand-50 dark:bg-brand/10 rounded-xl border border-brand-100 dark:border-brand-700">
                <div className="flex items-start space-x-3 mb-4">
                  <Loader2 className="w-5 h-5 text-brand dark:text-brand-light animate-spin flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-brand-dark dark:text-brand-100 mb-1">Generation in Progress</h4>
                    <p className="text-sm text-brand-700 dark:text-brand-200">{progressMessage}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-brand dark:text-brand-light font-medium">
                    <span>Progress</span>
                    <span>Est. {Math.floor(estimatedTime / 60)}:{String(estimatedTime % 60).padStart(2, '0')} remaining</span>
                  </div>
                  <div className="w-full bg-brand-100 dark:bg-brand-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, estimatedTime > 0 ? ((1 - estimatedTime / (mode === "custom" ? Math.max(60, Math.ceil(totalQuestions * 4.2)) : 420)) * 100) : 0)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-brand-100 dark:border-brand-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-800 dark:text-gray-200">What's happening:</strong> {mode === "custom" 
                      ? `Generating ${totalQuestions} questions across ${selectedSubjects.length} selected subject(s). Questions are distributed proportionally based on the AHC syllabus weightage.`
                      : "Generating 100 questions across 19 subjects with exact syllabus breakdown. Each subject has specific question types (e.g., Synonym, Antonym, Syllogism, etc.). This typically takes 5-7 minutes."
                    }
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
                <div className="p-3 bg-brand-50 dark:bg-brand/20 text-brand dark:text-brand-light rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{result.final_count} / {mode === "custom" ? totalQuestions : 100}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors">
                <div className="p-3 bg-brand-100 dark:bg-brand/20 text-brand dark:text-brand-light rounded-full">
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
                  <span className="text-xs px-2 py-1 bg-brand-50 dark:bg-brand/20 text-brand-700 dark:text-brand-light rounded-full font-medium">
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
                    onClick={handleDownloadCSV}
                    className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center"
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
                      <th className="p-4 w-16 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Edit</th>
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
                        <td className="p-2 border-r border-gray-100 dark:border-gray-700 text-center">
                          <button
                            onClick={() => openEditModal(rowIndex)}
                            className="p-2 text-brand hover:bg-brand-50 dark:hover:bg-brand/10 rounded-lg transition-colors"
                            title="Edit question"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                        {csvHeaders.map((header) => (
                          <td key={`${rowIndex}-${header}`} className="p-3 border-r border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 max-w-[250px]">
                            <span className="line-clamp-3">{row[header] || ""}</span>
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
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Correct Questions</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{validationResults.summary?.correct_questions || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Issues Found</p>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{validationResults.summary?.questions_with_issues || 0}</p>
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
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' 
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

      {/* Edit Question Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
                <Pencil className="w-5 h-5 mr-2 text-brand" />
                Edit Question #{editRowIndex + 1}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              
              {/* Subject & Topic (read-only info) */}
              {(editForm["Subject"] || editForm["Topic"]) && (
                <div className="flex gap-3">
                  {editForm["Subject"] && (
                    <span className="text-xs px-3 py-1 bg-brand-50 dark:bg-brand/20 text-brand dark:text-brand-light rounded-full font-medium">
                      {editForm["Subject"]}
                    </span>
                  )}
                  {editForm["Topic"] && (
                    <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                      {editForm["Topic"]}
                    </span>
                  )}
                </div>
              )}

              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Question</label>
                <textarea
                  value={editForm["Question"] || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, "Question": e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all resize-none"
                  rows={3}
                />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["Option A", "Option B", "Option C", "Option D"].map((opt) => (
                  <div key={opt}>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{opt}</label>
                    <input
                      type="text"
                      value={editForm[opt] || ""}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, [opt]: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    />
                  </div>
                ))}
              </div>

              {/* Correct Answer */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correct Answer</label>
                <select
                  value={editForm["Correct Answer"] || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, "Correct Answer": e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all cursor-pointer"
                >
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                  <option value="d">D</option>
                </select>
              </div>

              {/* AI Edit Section */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5 text-brand" />
                  Edit with AI
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !isAiEditing) handleAiEdit(); }}
                    placeholder="e.g. Make this question harder, Change options to Hindi..."
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                  />
                  <button
                    onClick={handleAiEdit}
                    disabled={isAiEditing || !aiPrompt.trim()}
                    className={`px-4 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all ${
                      isAiEditing || !aiPrompt.trim()
                        ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                        : "bg-brand hover:bg-brand-dark shadow-md"
                    }`}
                  >
                    {isAiEditing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Ask AI to modify this question. Press Enter or click Send.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-md transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
