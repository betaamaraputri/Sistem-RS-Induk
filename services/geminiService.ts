import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { allTools, executeTool } from "./tools";
import { AgentRole } from "../types";

// System Instruction based on the Professor's prompt
const SYSTEM_INSTRUCTION = `
Anda adalah "Mengelola Operasi Rumah Sakit", orkestrator agen cerdas untuk Rumah Sakit INDUK.

Tugas Utama Anda:
1. Pahami permintaan pengguna terkait operasi rumah sakit.
2. Rutekan secara akurat ke sub-agen (tools) yang tepat:
   - Manajemen Pasien (manage_patient): Penerimaan, pemulangan, lokasi/status pasien.
   - Penjadwalan Janji Temu (manage_appointment): Booking, reschedule, cancel janji temu.
   - Rekam Medis (access_medical_records): Riwayat medis, hasil tes, diagnosis. (Jaga privasi).
   - Penagihan dan Asuransi (process_billing_insurance): Penagihan, klaim, pembayaran.
3. Jika permintaan ambigu, mintalah klarifikasi.
4. Setelah tool dieksekusi, sampaikan hasilnya kembali kepada pengguna dengan bahasa yang profesional, jelas, dan empati.

JANGAN berhalusinasi data. Gunakan output dari tool untuk menjawab.
`;

let chatHistory: Content[] = [];

// Initialize API Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const sendMessageToOrchestrator = async (
  message: string,
  onToolStart: (role: AgentRole) => void,
  onToolEnd: () => void
): Promise<{ text: string; role: AgentRole }> => {
  
  const ai = getClient();
  const model = "gemini-2.5-flash"; // Efficient for tool calling

  // Construct current conversation for context
  const currentHistory = [...chatHistory, { role: "user", parts: [{ text: message }] }];

  try {
    // 1. Initial Request to Orchestrator
    const result = await ai.models.generateContent({
      model,
      contents: currentHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: allTools }],
      },
    });

    // Extract function calls safely using the SDK property
    const functionCalls = result.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0]; // Assume single tool call for this architecture
      
      // Determine which sub-agent is being called for UI feedback
      let activeRole = AgentRole.ORCHESTRATOR;
      if (call.name === 'manage_patient') activeRole = AgentRole.PATIENT_MGMT;
      else if (call.name === 'manage_appointment') activeRole = AgentRole.SCHEDULING;
      else if (call.name === 'access_medical_records') activeRole = AgentRole.MEDICAL_RECORDS;
      else if (call.name === 'process_billing_insurance') activeRole = AgentRole.BILLING;

      // Trigger UI callback
      onToolStart(activeRole);

      // Execute the mock tool
      const { output, role } = await executeTool(call.name, call.args);
      
      onToolEnd();

      // 2. Send Tool Response back to Gemini
      // Construct the tool response part
      const toolResponsePart = {
        functionResponse: {
          name: call.name,
          response: { result: output }, // The structured output from our mock tool
        },
      };

      // We need to send the history + the model's function call + the tool response
      // Ensure we use the exact content object returned by the API for the model's turn
      const historyWithCall = [
        ...currentHistory,
        result.candidates![0].content, // The assistant's message containing the tool call
        { role: "tool", parts: [toolResponsePart] } // Our response
      ];

      // Final generation based on tool output
      const finalResult = await ai.models.generateContent({
        model,
        contents: historyWithCall,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION
        }
      });

      // Update history
      chatHistory = [
        ...historyWithCall,
        finalResult.candidates![0].content
      ];

      return {
        text: finalResult.text || "Operasi selesai, namun tidak ada respons teks.",
        role: role // Return the role of the agent that performed the action
      };

    } else {
      // No tool called (General chat or clarification)
      const text = result.text || "Maaf, saya tidak mengerti permintaan Anda.";
      
      chatHistory = [
        ...currentHistory,
        result.candidates![0].content
      ];

      return {
        text,
        role: AgentRole.ORCHESTRATOR
      };
    }

  } catch (error) {
    console.error("Gemini Error:", error);
    onToolEnd();
    return {
      text: "Maaf, terjadi kesalahan sistem saat menghubungi Agen Pusat. Silakan coba lagi.",
      role: AgentRole.ORCHESTRATOR
    };
  }
};

export const resetChat = () => {
  chatHistory = [];
};