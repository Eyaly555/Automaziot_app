import { generateProposalPDF } from './exportProposalPDF'; // IMPORT THE GOOD FUNCTION
import { SelectedService, ProposalData } from '../types/proposal';
import { AiProposalDoc } from '../schemas/aiProposal.schema';
import { formatHebrewDate } from './exportProposalPDF'; // Import helper function

interface ProposalPDFOptions {
  clientName: string;
  clientCompany?: string;
  services: SelectedService[];
  proposalData: ProposalData;
  aiProposal?: AiProposalDoc; // Optional AI-generated content
}

/**
 * Download Professional PDF directly using the shared generateProposalPDF logic.
 */
export const downloadProposalPDF = async (options: ProposalPDFOptions): Promise<void> => {
  try {
    const pdfBlob = await generateProposalPDF(options); // Use the working function

    // Create a URL for the blob and trigger download
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proposal-${options.clientName}-${formatHebrewDate(new Date())}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL

  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};
