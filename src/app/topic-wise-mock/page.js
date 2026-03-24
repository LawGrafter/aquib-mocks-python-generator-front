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
  BookOpen,
  Target,
  List,
  Hash
} from "lucide-react";
import { apiBaseUrl, generateCustomTest, fetchCsvContent } from "@/utils/api";
import Papa from "papaparse";

export default function TopicWiseMock() {
  const [subject, setSubject] = useState("");
  const [topicsInput, setTopicsInput] = useState("");
  const [difficulty, setDifficulty] = useState("moderate");
  const [totalQuestions, setTotalQuestions] = useState(10);
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [csvData, setCsvData] = useState([]); // Array of objects or arrays
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const resolveUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`;
  };

  const handleGenerate = async () => {
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (!topicsInput.trim()) {
      setError("Please enter at least one topic.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCsvData([]);
    setCsvHeaders([]);

    // Parse topics from input (comma separated)
    const topicsList = topicsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

    try {
      // 1. Generate the test
      const data = await generateCustomTest(subject, topicsList, difficulty, totalQuestions);
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
      setError("Failed to generate custom mock test. Please check the backend connection.");
      console.error(err);
    } finally {
      setIsLoading(false);
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
    link.setAttribute("download", `custom_mock_test_${subject.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            Topic Wise Mock
            <span className="ml-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </span>
          </h2>
        </div>

        {/* Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                Subject
              </label>
              <input 
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Ancient History"
                className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-gray-700 dark:text-gray-200"
              />
            </div>

            {/* Topics */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center">
                <List className="w-4 h-4 mr-2 text-purple-500" />
                Topics (comma separated)
              </label>
              <input 
                type="text"
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                placeholder="e.g. Gupta Empire, Mauryan Admin"
                className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-gray-700 dark:text-gray-200"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center">
                <Target className="w-4 h-4 mr-2 text-purple-500" />
                Difficulty
              </label>
              <div className="relative">
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl appearance-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="easy-to-moderate">Easy to Moderate</option>
                  <option value="hard">Hard</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

             {/* Total Questions */}
             <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center">
                <Hash className="w-4 h-4 mr-2 text-purple-500" />
                Total Questions
              </label>
              <input 
                type="number"
                min="1"
                max="500"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-gray-700 dark:text-gray-200"
              />
            </div>

          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`
                px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 
                flex items-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]
                ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/40'}
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center border border-red-100 dark:border-red-800">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Generated Questions</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{result.total_generated}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Final Unique Count</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{result.final_unique_count}</h3>
                </div>
              </div>
            </div>

            {(result.pdf_url_en || result.pdf_url_hi) && (
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">PDF Downloads</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Download the generated MCQs PDF in English or Hindi.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  {result.pdf_url_en && (
                    <a
                      href={resolveUrl(result.pdf_url_en)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download English PDF
                    </a>
                  )}
                  {result.pdf_url_hi && (
                    <a
                      href={resolveUrl(result.pdf_url_hi)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-green-200 dark:shadow-green-900/20 transition-all flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Hindi PDF
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Live Preview Table */}
            {csvData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
                      <FileSpreadsheet className="w-5 h-5 mr-2 text-purple-500" />
                      Live Preview & Edit
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Review and edit the generated questions before downloading.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center
                        ${isEditing 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}
                      `}
                    >
                      {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                      {isEditing ? "Finish Editing" : "Edit Mode"}
                    </button>
                    
                    <button
                      onClick={handleDownloadEdited}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-green-200 dark:shadow-green-900/20 transition-all flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
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
                        <tr key={rowIndex} className="hover:bg-purple-50/30 dark:hover:bg-gray-700/30 transition-colors group">
                          <td className="p-4 text-xs text-gray-400 dark:text-gray-500 font-mono border-r border-gray-100 dark:border-gray-700">
                            {rowIndex + 1}
                          </td>
                          {csvHeaders.map((header) => (
                            <td key={`${rowIndex}-${header}`} className="p-0 border-r border-gray-100 dark:border-gray-700 relative">
                              {isEditing ? (
                                <textarea
                                  value={row[header] || ""}
                                  onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                                  className="w-full h-full min-h-[50px] p-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-purple-500 dark:focus:ring-purple-400 focus:bg-white dark:focus:bg-gray-600 text-sm text-gray-700 dark:text-gray-200 resize-none overflow-hidden"
                                  rows={1}
                                  style={{ height: '100%' }}
                                />
                              ) : (
                                <div className="p-3 text-sm text-gray-700 dark:text-gray-300 min-h-[50px] whitespace-pre-wrap">
                                  {row[header]}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 text-xs text-center text-gray-500 dark:text-gray-400">
                  Showing {csvData.length} rows. {isEditing ? "Click on any cell to edit." : "Switch to Edit Mode to make changes."}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
