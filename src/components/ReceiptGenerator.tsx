
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Payment } from "@/types/entities";

interface ReceiptGeneratorProps {
  payment: Payment;
}

export default function ReceiptGenerator({ payment }: ReceiptGeneratorProps) {
  const generatePdf = () => {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(22);
    doc.text("Conglomerate Realty", 10, 20);
    doc.setFontSize(16);
    doc.text("Official Receipt", 10, 30);

    // Add payment details
    doc.setFontSize(12);
    doc.text(`Receipt #: ${payment.receipt_no}`, 10, 50);
    doc.text(`Date: ${new Date(payment.created_at).toLocaleDateString()}`, 10, 60);
    doc.text(`Client: ${(payment.clients as any)?.name || "N/A"}`, 10, 70);
    doc.text(`Amount: ${payment.amount}`, 10, 80);
    doc.text(`Payment Method: ${payment.payment_method}`, 10, 90);

    // Add footer
    doc.setFontSize(10);
    doc.text("Thank you for your business!", 10, 120);

    doc.save(`receipt-${payment.receipt_no}.pdf`);
  };

  return <Button onClick={generatePdf}>Generate Receipt</Button>;
}
