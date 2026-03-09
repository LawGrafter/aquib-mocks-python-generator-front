"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { BookOpen, Star, CheckCircle, ArrowRight, Bookmark } from "lucide-react";

const syllabusData = {
  "SSC Steno": [
    {
      subject: "General Intelligence & Reasoning",
      description: "Test of reasoning ability and decision making.",
      color: "blue",
      topics: ["Analogies", "Similarities & Differences", "Space Visualization", "Problem Solving", "Analysis", "Judgment", "Decision Making", "Visual Memory", "Discriminating Observation", "Relationship Concepts", "Arithmetical Reasoning", "Verbal & Figure Classification", "Arithmetical Number Series", "Non-Verbal Series"]
    },
    {
      subject: "General Awareness",
      description: "Knowledge of current events and general environment.",
      color: "green",
      topics: ["Current Events", "Sports", "History", "Culture", "Geography", "Economic Scene", "General Polity", "Indian Constitution", "Scientific Research"]
    },
    {
      subject: "English Language & Comprehension",
      description: "Testing of English language skills and comprehension.",
      color: "purple",
      topics: ["Vocabulary", "Grammar", "Sentence Structure", "Synonyms", "Antonyms", "Correct Usage", "Writing Ability", "Reading Comprehension"]
    }
  ],
  "SSC CGL": [
    {
      subject: "General Intelligence & Reasoning",
      description: "Logical thinking and analytical skills.",
      color: "indigo",
      topics: ["Analogies", "Classification", "Series", "Coding-Decoding", "Blood Relations", "Direction Sense", "Venn Diagrams", "Missing Number", "Paper Folding & Cutting"]
    },
    {
      subject: "General Awareness",
      description: "General knowledge across various domains.",
      color: "teal",
      topics: ["History", "Geography", "Polity", "Economics", "Physics", "Chemistry", "Biology", "Current Affairs", "Static GK"]
    },
    {
      subject: "Quantitative Aptitude",
      description: "Numerical ability and mathematical concepts.",
      color: "orange",
      topics: ["Number System", "HCF & LCM", "Simplification", "Ratio & Proportion", "Average", "Percentage", "Profit & Loss", "Simple & Compound Interest", "Time & Work", "Time, Speed & Distance", "Algebra", "Geometry", "Trigonometry", "Mensuration", "Data Interpretation"]
    },
    {
      subject: "English Comprehension",
      description: "Understanding and usage of English language.",
      color: "pink",
      topics: ["Reading Comprehension", "Cloze Test", "Para Jumbles", "Fill in the Blanks", "Error Spotting", "Sentence Improvement", "Idioms & Phrases", "One Word Substitution", "Spelling Correction"]
    }
  ],
  "AHC": [
    {
      subject: "English",
      description: "Proficiency in English writing and grammar.",
      color: "cyan",
      topics: ["Essay Writing", "Letter Writing", "Precis Writing", "Comprehension", "Vocabulary", "Grammar", "Idioms & Phrases"]
    },
    {
      subject: "Hindi",
      description: "Proficiency in Hindi writing and grammar.",
      color: "amber",
      topics: ["Essay Writing", "Letter Writing", "Precis Writing", "Comprehension", "Vocabulary", "Grammar", "Idioms & Phrases"]
    },
    {
      subject: "General Studies",
      description: "Knowledge of Indian history, geography, and polity.",
      color: "rose",
      topics: ["Indian History", "Indian National Movement", "Indian Geography", "Indian Economy", "Indian Polity", "Current National & International Events"]
    },
    {
      subject: "Mathematics",
      description: "Basic mathematical concepts and problem solving.",
      color: "emerald",
      topics: ["Number System", "Whole Numbers", "Decimals & Fractions", "Relationship between Numbers", "Percentage", "Ratio & Proportion", "Average", "Interest", "Profit & Loss", "Discount", "Use of Tables & Graphs", "Mensuration", "Time & Distance", "Ratio & Time", "Time & Work"]
    }
  ]
};

const SyllabusPage = () => {
  const [activeTab, setActiveTab] = useState("SSC Steno");

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              Syllabus <span className="ml-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl"><BookOpen className="w-6 h-6" /></span>
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Explore the comprehensive syllabus for various competitive exams.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-2 inline-flex flex-wrap gap-2">
          {Object.keys(syllabusData).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 transform scale-105"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {syllabusData[activeTab].map((section, index) => (
            <div 
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 relative overflow-hidden"
            >
              {/* Decorative Background Gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${section.color}-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700`}></div>

              <div className="relative z-10">
                {/* Subject Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${section.color}-50 dark:bg-${section.color}-900/20 text-${section.color}-600 dark:text-${section.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider text-${section.color}-600 dark:text-${section.color}-400 bg-${section.color}-50 dark:bg-${section.color}-900/20 px-3 py-1 rounded-full`}>
                    {section.topics.length} Topics
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {section.subject}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {section.description}
                </p>

                {/* Topics List */}
                <div className="space-y-3">
                  {section.topics.map((topic, i) => (
                    <div key={i} className="flex items-start group/item">
                      <CheckCircle className={`w-4 h-4 mt-0.5 mr-3 text-${section.color}-500 dark:text-${section.color}-400 flex-shrink-0 opacity-60 group-hover/item:opacity-100 transition-opacity`} />
                      <span className="text-sm text-gray-600 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">
                        {topic}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default SyllabusPage;
