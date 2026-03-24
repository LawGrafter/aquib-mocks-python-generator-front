// Base URL for the API
const API_BASE_URL = "http://127.0.0.1:8000";
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
export const generateCustomTest = async (subject, topics, difficulty = "moderate", totalQuestions = 10) => {
  const url = `${API_BASE_URL}/exam/generate-custom`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        subject, 
        topics, 
        difficulty, 
        total_questions: parseInt(totalQuestions) 
      }),
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
