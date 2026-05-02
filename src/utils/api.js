// Base URL for the API — set NEXT_PUBLIC_API_URL in Vercel env vars
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export const apiBaseUrl = API_BASE_URL;

/**
 * Uploads files to the Content Maker API
 * @param {File[]} files - Array of files to upload
 * @param {string} topic - The topic to focus on
 * @returns {Promise<{pdf_url: string}>} - The response containing the PDF URL
 */
export const createContent = async (files, topic) => {
  const formData = new FormData();
  
  // Append all files to the form data
  files.forEach((file) => {
    formData.append("files", file);
  });

  // Construct URL with query parameter
  const url = new URL(`${API_BASE_URL}/contentmaker`);
  if (topic) {
    url.searchParams.append("topic", topic);
  }

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      body: formData,
      // Note: Content-Type header is not set manually for multipart/form-data
      // as the browser sets it automatically with the correct boundary
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
};

/**
 * Generates a full mock test
 * @param {string} difficulty - The difficulty level ("easy", "moderate", "easy-to-moderate")
 * @returns {Promise<{total_generated: number, final_unique_count: number, csv_url: string, breakdown: object}>}
 */
export const generateFullTest = async (difficulty = "moderate") => {
  const url = `${API_BASE_URL}/exam/generate-full-test`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ difficulty }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating full test:", error);
    throw error;
  }
};

/**
 * Generates a custom topic-wise mock test
 * @param {string} subject - The main subject name
 * @param {string[]} topics - List of specific sub-topics
 * @param {string} difficulty - Difficulty level ("easy", "moderate", "easy-to-moderate", "hard")
 * @param {number} totalQuestions - Number of questions to generate
 * @returns {Promise<{total_generated: number, final_unique_count: number, csv_url: string, subject: string, pdf_url_en?: string, pdf_url_hi?: string}>}
 */
export const generateCustomTest = async (subject, topics, difficulty = "moderate", totalQuestions = 10, previousCsvFiles = []) => {
  const url = `${API_BASE_URL}/exam/generate-custom`;
  
  try {
    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("topics", Array.isArray(topics) ? topics.join(", ") : topics);
    formData.append("difficulty", difficulty);
    formData.append("total_questions", parseInt(totalQuestions));

    if (previousCsvFiles && previousCsvFiles.length > 0) {
      previousCsvFiles.forEach((file) => {
        formData.append("previous_csvs", file);
      });
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating custom test:", error);
    throw error;
  }
};

/**
 * Fetches CSV content from a URL
 * @param {string} csvUrl - The relative URL of the CSV file
 * @returns {Promise<string>} - The raw CSV content
 */
export const fetchCsvContent = async (csvUrl) => {
  // Ensure we have a full URL
  const fullUrl = csvUrl.startsWith("http") ? csvUrl : `${API_BASE_URL}${csvUrl}`;
  
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error fetching CSV content:", error);
    throw error;
  }
};

/**
 * Validates questions using AI to check correctness and find duplicates
 * @param {Array} questions - Array of question objects
 * @returns {Promise<Object>} - Validation results
 */
export const validateQuestionsWithAI = async (questions) => {
  const url = `${API_BASE_URL}/exam/validate-questions`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questions }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error validating questions:", error);
    throw error;
  }
};

/**
 * Generates AHC Challenge 2026 exam with exact syllabus breakdown
 * @param {string} difficulty - Difficulty level ("easy", "moderate", "hard")
 * @param {File[]} previousCsvFiles - Optional array of previous CSV files for deduplication
 * @returns {Promise<{total_generated: number, final_count: number, csv_url: string, breakdown: object, duplicates_removed: number}>}
 */
export const generateAHCChallenge = async (difficulty = "moderate", previousCsvFiles = []) => {
  const url = `${API_BASE_URL}/ahc-challenge/generate`;
  
  try {
    const formData = new FormData();
    formData.append("difficulty", difficulty);
    
    if (previousCsvFiles && previousCsvFiles.length > 0) {
      previousCsvFiles.forEach((file) => {
        formData.append("previous_csvs", file);
      });
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating AHC Challenge:", error);
    throw error;
  }
};

/**
 * Generates AHC Custom exam with selected subjects and question count
 * @param {string} difficulty - Difficulty level
 * @param {string[]} subjects - Array of subject names
 * @param {number} totalQuestions - Total number of questions to generate
 * @param {File[]} previousCsvFiles - Optional CSV files for deduplication
 */
export const generateAHCCustom = async (difficulty = "moderate", subjects = [], totalQuestions = 10, previousCsvFiles = []) => {
  const url = `${API_BASE_URL}/ahc-challenge/generate-custom`;
  
  try {
    const formData = new FormData();
    formData.append("difficulty", difficulty);
    formData.append("subjects", subjects.join(","));
    formData.append("total_questions", totalQuestions.toString());
    
    if (previousCsvFiles && previousCsvFiles.length > 0) {
      previousCsvFiles.forEach((file) => {
        formData.append("previous_csvs", file);
      });
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating AHC Custom:", error);
    throw error;
  }
};

/**
 * Uses AI to edit/modify a single question based on a user prompt
 */
export const aiEditQuestion = async (data) => {
  const url = `${API_BASE_URL}/ahc-challenge/ai-edit`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error AI editing question:", error);
    throw error;
  }
};
