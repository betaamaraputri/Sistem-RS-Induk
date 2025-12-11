import { FunctionDeclaration, Type } from "@google/genai";
import { AgentRole } from "../types";

// --- Tool Definitions (Schema) ---

export const patientManagementTool: FunctionDeclaration = {
  name: "manage_patient",
  description: "Menangani tugas administrasi pasien termasuk penerimaan (admission), pemulangan (discharge), dan pengecekan status lokasi pasien.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ["admission", "discharge", "check_status"],
        description: "Tindakan yang akan dilakukan."
      },
      patientName: {
        type: Type.STRING,
        description: "Nama lengkap pasien."
      },
      details: {
        type: Type.STRING,
        description: "Detail tambahan seperti alasan masuk, nomor kamar, atau kondisi saat pulang."
      }
    },
    required: ["action", "patientName"]
  }
};

export const schedulingTool: FunctionDeclaration = {
  name: "manage_appointment",
  description: "Menangani penjadwalan, termasuk pemesanan (booking), penjadwalan ulang (reschedule), dan pembatalan (cancel) janji temu.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ["book", "reschedule", "cancel", "check_availability"],
        description: "Tindakan penjadwalan."
      },
      patientName: { type: Type.STRING, description: "Nama pasien." },
      doctorName: { type: Type.STRING, description: "Nama dokter (opsional)." },
      date: { type: Type.STRING, description: "Tanggal dan waktu yang diminta." },
      reason: { type: Type.STRING, description: "Alasan kunjungan." }
    },
    required: ["action", "patientName"]
  }
};

export const medicalRecordsTool: FunctionDeclaration = {
  name: "access_medical_records",
  description: "Mengakses riwayat medis, hasil tes, dan diagnosis dengan protokol privasi yang ketat.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientName: { type: Type.STRING, description: "Nama pasien." },
      queryType: {
        type: Type.STRING,
        enum: ["history", "test_results", "diagnosis"],
        description: "Jenis informasi medis yang diminta."
      },
      verificationCode: { type: Type.STRING, description: "Kode simulasi otorisasi (opsional)." }
    },
    required: ["patientName", "queryType"]
  }
};

export const billingTool: FunctionDeclaration = {
  name: "process_billing_insurance",
  description: "Mengelola penagihan, klaim asuransi, dan pertanyaan pembayaran.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientName: { type: Type.STRING, description: "Nama pasien." },
      action: {
        type: Type.STRING,
        enum: ["create_invoice", "check_insurance", "process_payment", "inquiry"],
        description: "Tindakan keuangan."
      },
      details: { type: Type.STRING, description: "Detail polis atau jumlah pembayaran." }
    },
    required: ["patientName", "action"]
  }
};

export const allTools = [
  patientManagementTool,
  schedulingTool,
  medicalRecordsTool,
  billingTool
];

// --- Mock Execution Logic ---

export const executeTool = async (name: string, args: any): Promise<{ output: string; role: AgentRole }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log(`Executing Tool: ${name}`, args);

  switch (name) {
    case "manage_patient":
      return {
        role: AgentRole.PATIENT_MGMT,
        output: JSON.stringify({
          status: "success",
          message: `Administrasi Pasien Berhasil. Tindakan '${args.action}' untuk pasien ${args.patientName} telah dicatat dalam sistem administrasi pusat.`,
          timestamp: new Date().toISOString()
        })
      };

    case "manage_appointment":
      return {
        role: AgentRole.SCHEDULING,
        output: JSON.stringify({
          status: "confirmed",
          message: `Sistem Penjadwalan: Permintaan '${args.action}' untuk ${args.patientName} pada ${args.date || 'tanggal yang tersedia'} berhasil diproses. Notifikasi konfirmasi telah dikirim.`,
          appointmentId: "APT-" + Math.floor(Math.random() * 10000)
        })
      };

    case "access_medical_records":
      return {
        role: AgentRole.MEDICAL_RECORDS,
        output: JSON.stringify({
          status: "accessed",
          securityLevel: "HIGH",
          message: `Akses Data Medis (${args.queryType}) untuk ${args.patientName} diberikan. [DATA TERENKRIPSI: Diagnosis stabil, Hasil Darah Normal]. Privasi terjaga sesuai protokol RS.`,
        })
      };

    case "process_billing_insurance":
      return {
        role: AgentRole.BILLING,
        output: JSON.stringify({
          status: "processed",
          message: `Transaksi Keuangan (${args.action}) untuk ${args.patientName} selesai. Status asuransi diverifikasi. Rincian tagihan telah diperbarui di buku besar.`,
          balanceDue: "IDR 0"
        })
      };

    default:
      return {
        role: AgentRole.ORCHESTRATOR,
        output: "Error: Sub-agen tidak dikenal atau gagal merespons."
      };
  }
};