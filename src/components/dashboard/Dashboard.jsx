"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Folder, FileText, File, MoreHorizontal, User, LayoutGrid, FileSpreadsheet, ArrowRight, BookOpen } from "lucide-react";

// Mock Data
const quickAccessFolders = [
  { 
    id: 'feature-1', 
    name: "APS/PS Full Mock", 
    type: "feature", 
    color: "blue", 
    icon: FileSpreadsheet, 
    href: "/api-full-mock",
    description: "Generate & Edit Mock Tests"
  },
  { 
    id: 'feature-3', 
    name: "Topic Wise Mock", 
    type: "feature", 
    color: "white", 
    icon: BookOpen, 
    href: "/topic-wise-mock",
    description: "Custom Subject Mock Tests"
  },
  { 
    id: 'feature-2', 
    name: "GS Content Maker", 
    type: "feature", 
    color: "white", 
    icon: FileText, 
    href: "/content-maker",
    description: "Create Content from PDFs"
  },
];

const syllabusData = {
  "SSC Steno": [
    {
      subject: "General Intelligence & Reasoning",
      topics: ["Analogies", "Similarities & Differences", "Space Visualization", "Problem Solving", "Analysis", "Judgment", "Decision Making", "Visual Memory", "Discriminating Observation", "Relationship Concepts", "Arithmetical Reasoning", "Verbal & Figure Classification", "Arithmetical Number Series", "Non-Verbal Series"]
    },
    {
      subject: "General Awareness",
      topics: ["Current Events", "Sports", "History", "Culture", "Geography", "Economic Scene", "General Polity", "Indian Constitution", "Scientific Research"]
    },
    {
      subject: "English Language & Comprehension",
      topics: ["Vocabulary", "Grammar", "Sentence Structure", "Synonyms", "Antonyms", "Correct Usage", "Writing Ability", "Reading Comprehension"]
    }
  ],
  "SSC CGL": [
    {
      subject: "General Intelligence & Reasoning",
      topics: ["Analogies", "Classification", "Series", "Coding-Decoding", "Blood Relations", "Direction Sense", "Venn Diagrams", "Missing Number", "Paper Folding & Cutting"]
    },
    {
      subject: "General Awareness",
      topics: ["History", "Geography", "Polity", "Economics", "Physics", "Chemistry", "Biology", "Current Affairs", "Static GK"]
    },
    {
      subject: "Quantitative Aptitude",
      topics: ["Number System", "HCF & LCM", "Simplification", "Ratio & Proportion", "Average", "Percentage", "Profit & Loss", "Simple & Compound Interest", "Time & Work", "Time, Speed & Distance", "Algebra", "Geometry", "Trigonometry", "Mensuration", "Data Interpretation"]
    },
    {
      subject: "English Comprehension",
      topics: ["Reading Comprehension", "Cloze Test", "Para Jumbles", "Fill in the Blanks", "Error Spotting", "Sentence Improvement", "Idioms & Phrases", "One Word Substitution", "Spelling Correction"]
    }
  ],
  "AHC": [
    {
      subject: "English",
      topics: ["Essay Writing", "Letter Writing", "Precis Writing", "Comprehension", "Vocabulary", "Grammar", "Idioms & Phrases"]
    },
    {
      subject: "Hindi",
      topics: ["Essay Writing", "Letter Writing", "Precis Writing", "Comprehension", "Vocabulary", "Grammar", "Idioms & Phrases"]
    },
    {
      subject: "General Studies",
      topics: ["Indian History", "Indian National Movement", "Indian Geography", "Indian Economy", "Indian Polity", "Current National & International Events"]
    },
    {
      subject: "Mathematics",
      topics: ["Number System", "Whole Numbers", "Decimals & Fractions", "Relationship between Numbers", "Percentage", "Ratio & Proportion", "Average", "Interest", "Profit & Loss", "Discount", "Use of Tables & Graphs", "Mensuration", "Time & Distance", "Ratio & Time", "Time & Work"]
    }
  ]
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = React.useState("SSC Steno");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          Dashboard <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg"><Folder className="w-6 h-6 fill-current" /></span>
        </h2>
        <div className="flex space-x-2">
            <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"><LayoutGridIcon className="w-5 h-5"/></button>
            <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"><InfoIcon className="w-5 h-5"/></button>
        </div>
      </div>

      {/* Quick Access Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessFolders.map((item) => {
             const CardContent = (
                <div
                  className={`relative p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col justify-between
                    ${item.color === 'blue' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700'}
                  `}
                >
                  {item.type === 'feature' ? (
                      <>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${item.color === 'blue' ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                                <item.icon className={`w-6 h-6 ${item.color === 'blue' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                            </div>
                            <ArrowRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${item.color === 'blue' ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                        </div>
                        
                        <div className="mt-auto">
                             <h4 className="font-bold text-lg leading-tight mb-1">{item.name}</h4>
                             <p className={`text-xs font-medium uppercase tracking-wide ${item.color === 'blue' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                {item.description}
                             </p>
                        </div>
                      </>
                  ) : item.type === 'folder' ? (
                      <>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-medium uppercase opacity-70">Shared with</span>
                            <MoreHorizontal className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${item.color === 'blue' ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                        </div>
                        
                        <div className="flex -space-x-2 mb-4">
                            {(item.sharedWith || []).map((u, i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700 bg-gray-200 dark:bg-gray-600 overflow-hidden relative">
                                    <Image src={`https://i.pravatar.cc/100?img=${i + (typeof item.id === 'number' ? item.id : 0) * 2}`} alt="User" fill className="object-cover" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                             <div className="flex items-center space-x-2">
                                <Folder className={`w-10 h-10 ${item.color === 'blue' ? 'text-blue-200 fill-current' : 'text-blue-500 dark:text-blue-400 fill-current'}`} />
                             </div>
                             <h4 className="mt-2 font-semibold text-lg">{item.name}</h4>
                        </div>
                      </>
                  ) : (
                      <>
                         <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                            </div>
                             <MoreHorizontal className="w-5 h-5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <h4 className="mt-2 font-semibold text-blue-600 dark:text-blue-400 text-sm leading-tight">{item.name}</h4>
                         <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 font-medium uppercase">Last Modified</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{item.lastModified}</p>
                      </>
                  )}
                </div>
             );

             return item.href ? (
                <Link key={item.id} href={item.href} className="block h-full">
                    {CardContent}
                </Link>
             ) : (
                <div key={item.id} className="block h-full">
                    {CardContent}
                </div>
             );
          })}
        </div>
      </div>

      {/* Syllabus Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Syllabus</h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {Object.keys(syllabusData).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {syllabusData[activeTab].map((section, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300"
                >
                  <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                    <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                    {section.subject}
                  </h4>
                  <ul className="space-y-2">
                    {section.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                        <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                        <span className="leading-relaxed">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const LayoutGridIcon = ({className}) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const InfoIcon = ({className}) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const FileIcon = ({ type }) => {
    const colors = {
        doc: "text-blue-500",
        xls: "text-green-500",
        pdf: "text-red-500",
        img: "text-orange-500",
        default: "text-gray-500"
    };
    
    const colorClass = colors[type] || colors.default;

    if (type === 'img') return <div className={`p-2 rounded bg-orange-100 ${colorClass}`}><File className="w-5 h-5" /></div>;
    if (type === 'pdf') return <div className={`p-2 rounded bg-red-100 ${colorClass}`}><FileText className="w-5 h-5" /></div>;
    if (type === 'xls') return <div className={`p-2 rounded bg-green-100 ${colorClass}`}><LayoutGrid className="w-5 h-5" /></div>; // Using generic icon for now
    
    return <div className={`p-2 rounded bg-blue-100 ${colorClass}`}><FileText className="w-5 h-5" /></div>;
};

export default Dashboard;
