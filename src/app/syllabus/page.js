"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { BookOpen, Star, CheckCircle, Bookmark } from "lucide-react";

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
      subject: "English (10 Qs)",
      description: "English language proficiency — vocabulary, grammar & comprehension.",
      color: "cyan",
      topics: ["Synonym (2)", "Antonym (2)", "Spot Error (2)", "Direct & Indirect Speech (1)", "Spelling Correction (1)", "Punctuation Error (1)", "Active-Passive Voice (1)"]
    },
    {
      subject: "Hindi (7 Qs)",
      description: "Hindi language — grammar, vocabulary & literary devices.",
      color: "amber",
      topics: ["Vilom (1)", "Paryayvachi (1)", "Upsarg (1)", "Pratyay (1)", "Sandhi Viched (1)", "Alankar (1)", "Samas (1)"]
    },
    {
      subject: "Reasoning (10 Qs)",
      description: "Logical reasoning and analytical ability.",
      color: "blue",
      topics: ["Number/Letter Series (1)", "Syllogism (2)", "Alphabet Series (1)", "Odd One Out (1)", "Coding-Decoding (1)", "Dice (1)", "Calendar (1)", "Direction (1)", "Blood Relation (1)"]
    },
    {
      subject: "Computer (10 Qs)",
      description: "Computer fundamentals, networking & MS Office.",
      color: "indigo",
      topics: ["Full Form (1)", "Networking (1)", "Internet Facts (1)", "Printer (1)", "Computer Generation/Invention (1)", "Topology (1)", "Operating System (1)", "MS Word Shortcut Key (1)", "MS PowerPoint Shortcut Key (1)", "MS Excel Shortcut Key (1)"]
    },
    {
      subject: "Economics (3 Qs)",
      description: "Indian economy, fiscal policy & banking.",
      color: "emerald",
      topics: ["Book & Author (1)", "Fiscal Policy (1)", "Repo Rate & Reverse Repo Rate (1)"]
    },
    {
      subject: "Environment (3 Qs)",
      description: "Ecology, wildlife & environmental science.",
      color: "green",
      topics: ["Wildlife Sanctuary (1)", "Bird Sanctuary (1)", "Ecological Pyramid (1)"]
    },
    {
      subject: "Polity (5 Qs)",
      description: "Indian Constitution, governance & political science.",
      color: "purple",
      topics: ["Articles of Constitution (2)", "Making of Indian Constitution (1)", "Chief Minister (article-based) (1)", "Constituent Assembly Members (1)"]
    },
    {
      subject: "Indian National Movement (8 Qs)",
      description: "Freedom struggle, revolts & key personalities.",
      color: "rose",
      topics: ["Revolt of 1857 (1)", "Book & Author (1)", "Newspaper Founder (1)", "Movement-based (1)", "Charter Acts (1)", "Governor-General/Lord Chronology (2)", "Civil Disobedience Movement (1)"]
    },
    {
      subject: "Ancient History (3 Qs)",
      description: "Indus Valley, Vedic period & ancient civilizations.",
      color: "orange",
      topics: ["Book & Author (1)", "Indus Valley / Rigveda Mandal (1)", "Jainism (1)"]
    },
    {
      subject: "Medieval History (2 Qs)",
      description: "Mughal Empire & medieval Indian history.",
      color: "yellow",
      topics: ["Book & Author (1)", "Mughal Empire (1)"]
    },
    {
      subject: "Chemistry (2 Qs)",
      description: "Chemical formulas, metals & everyday chemistry.",
      color: "teal",
      topics: ["Formula-based (1)", "Metal/Alloy or Everyday Chemistry (1)"]
    },
    {
      subject: "Biology (3 Qs)",
      description: "Human body, diseases & life sciences.",
      color: "lime",
      topics: ["Disease-based (1)", "Measuring Instrument (1)", "Animal/Plant Kingdom (1)"]
    },
    {
      subject: "Physics (3 Qs)",
      description: "Laws of physics, energy & measuring instruments.",
      color: "sky",
      topics: ["Measuring Instrument (1)", "Law-based (1)", "Kinetic/Potential Energy (1)"]
    },
    {
      subject: "World Geography (4 Qs)",
      description: "Global geography — oceans, mountains & climate.",
      color: "violet",
      topics: ["Ocean Current (1)", "Mountain (1)", "Grassland (1)", "General World Geography (1)"]
    },
    {
      subject: "Indian Geography (4 Qs)",
      description: "Rivers, mountains, boundaries & physical features of India.",
      color: "fuchsia",
      topics: ["Peninsular River (1)", "Strait/Channel — Andaman & Nicobar (1)", "Lesser Himalaya vs Trans Himalaya (1)", "India Boundaries with Neighbors (1)"]
    },
    {
      subject: "Agriculture (3 Qs)",
      description: "Soil science, green revolution & irrigation.",
      color: "emerald",
      topics: ["Soil — Laterite/Red Soil (1)", "Green Revolution (1)", "Irrigation Methods (1)"]
    },
    {
      subject: "Census (3 Qs)",
      description: "Indian Census facts & statistics.",
      color: "slate",
      topics: ["Static/Fact-based Census Questions (3)"]
    },
    {
      subject: "Current Affairs 2025 (4 Qs)",
      description: "Latest events, schemes & important days.",
      color: "red",
      topics: ["Military Exercise (1)", "Important Day & Theme (1)", "Central Government Scheme (1)", "Additional Current Affair (1)"]
    },
    {
      subject: "Art & Culture (3 Qs)",
      description: "Indian festivals, dance forms & musical traditions.",
      color: "pink",
      topics: ["Festival (1)", "Dance (1)", "Gharana (1)"]
    },
    {
      subject: "UP GK (5 Qs)",
      description: "Uttar Pradesh — geography, history, schemes & personalities.",
      color: "orange",
      topics: ["UP State Fact — Capital/District/Division (1)", "UP Historical Place / Heritage Site (1)", "UP Government Scheme / Yojana (1)", "UP Rivers / Geography / Lakes (1)", "UP Famous Personality / Freedom Fighter (1)"]
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
              Syllabus <span className="ml-3 bg-brand-50 dark:bg-brand/20 text-brand dark:text-brand-light p-2 rounded-xl"><BookOpen className="w-6 h-6" /></span>
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
                  ? "bg-brand text-white shadow-md shadow-brand/30 dark:shadow-brand/20 transform scale-105"
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
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-brand-100 dark:hover:border-brand/30 transition-all duration-300 relative overflow-hidden"
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

                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-brand dark:group-hover:text-brand-light transition-colors">
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

              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default SyllabusPage;
