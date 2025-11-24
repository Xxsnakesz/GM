
import { GoogleGenAI } from "@google/genai";
import { Project } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  async getPortfolioAnalysis(projects: Project[]): Promise<string> {
    if (!process.env.API_KEY) return "API Key not configured.";

    // Simplify data for the prompt to save tokens
    const projectSummary = projects.map(p => ({
      name: p.name,
      status: p.status,
      value: p.value,
      notes: p.notes
    }));

    const prompt = `
      You are an executive assistant to a General Manager. 
      Analyze the following project portfolio data and provide a concise executive summary.
      Focus on:
      1. Overall health of the portfolio.
      2. Any high-value projects that might be at risk (based on notes or status).
      3. A quick financial outlook.
      
      Keep it professional, brief (under 150 words), and actionable. Use bullet points.
      
      Data: ${JSON.stringify(projectSummary)}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "No analysis generated.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Unable to generate analysis at this time.";
    }
  },

  async getProjectReport(project: Project): Promise<string> {
    if (!process.env.API_KEY) return "API Key not configured.";

    const prompt = `
      Draft a short, professional status update email for the project "${project.name}".
      
      Project Details:
      - Customer: ${project.customerName}
      - Status: ${project.status}
      - Value: ${project.value}
      - Current Notes: ${project.notes}
      
      The email should be addressed to the stakeholders. Highlight progress and any blockers.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "No report generated.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Unable to generate report.";
    }
  }
};
