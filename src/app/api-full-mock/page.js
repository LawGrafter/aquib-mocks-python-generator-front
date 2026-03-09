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
  BarChart3
} from "lucide-react";
import { generateFullTest, fetchCsvContent } from "@/utils/api";
import Papa from "papaparse";

export default function ApiFullMock() {
  const [difficulty, setDifficulty] = useState("moderate");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [csvData, setCsvData] = useState([]); // Array of objects or arrays
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCsvData([]);
    setCsvHeaders([]);

    try {
      // 1. Generate the test
      const data = await generateFullTest(difficulty);
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

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            APS/PS Full Mock Generator 
            <span className="ml-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg">
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
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-400/20 focus:border-green-500 dark:focus:border-green-400 text-gray-800 dark:text-gray-100 transition-all cursor-pointer"
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
                  ? "bg-gray-300 cursor-not-allowed shadow-none" 
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:shadow-xl hover:scale-[1.02]"
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
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">Total Generated</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{result.total_generated}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
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
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                    {csvData.length} Rows
                  </span>
                </div>
                <div className="flex space-x-3">
                   <button
                    onClick={handleDownloadEdited}
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
                      <tr key={rowIndex} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors group">
                        <td className="p-4 text-xs text-gray-400 dark:text-gray-500 font-mono border-r border-gray-100 dark:border-gray-700">
                          {rowIndex + 1}
                        </td>
                        {csvHeaders.map((header) => (
                          <td key={`${rowIndex}-${header}`} className="p-0 border-r border-gray-100 dark:border-gray-700 relative">
                            <textarea
                              value={row[header] || ""}
                              onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                              className="w-full h-full min-h-[50px] p-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-600 text-sm text-gray-700 dark:text-gray-200 resize-none overflow-hidden"
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

          </div>
        )}

      </div>
    </AppLayout>
  );
}