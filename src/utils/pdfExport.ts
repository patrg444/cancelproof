import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscription, TimelineEvent, ProofDocument } from '@/types/subscription';
import { format } from 'date-fns';
import { getCancelByRuleLabel, getIntentLabel } from '@/utils/subscriptionHelpers';

export async function exportSubscriptionProofBinder(subscription: Subscription): Promise<void> {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CancelMem - Cancellation Proof Binder', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(16);
    doc.text(subscription.name, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated on ${format(new Date(), 'PPP')}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Reset color
    doc.setTextColor(0);
    yPosition += 15;

    // Subscription Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Subscription Details', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const details = [
      ['Service Name:', subscription.name],
      ['Amount:', `${subscription.currency} ${subscription.amount.toFixed(2)} / ${subscription.billingPeriod}`],
      ['Status:', subscription.status.toUpperCase()],
      ['Intent:', getIntentLabel(subscription.intent)],
      ['Cancel-By Rule:', getCancelByRuleLabel(subscription.cancelByRule)],
      ['Cancel-By Date:', format(new Date(subscription.cancelByDate), 'PPP')],
      ['Renewal Date:', format(new Date(subscription.renewalDate), 'PPP')],
      ['Cancellation Method:', subscription.cancellationMethod.replace('-', ' ').toUpperCase()],
      ['Proof Status:', subscription.proofStatus.toUpperCase()],
    ];

    if (subscription.cancellationDate) {
      details.push(['Cancellation Date:', format(new Date(subscription.cancellationDate), 'PPP')]);
    }

    if (subscription.cancelAttemptDate) {
      details.push(['Cancel Attempt Date:', format(new Date(subscription.cancelAttemptDate), 'PPP')]);
    }

    if (subscription.cancellationUrl) {
      details.push(['Cancellation URL:', subscription.cancellationUrl]);
    }

    if (subscription.supportContact) {
      details.push(['Support Contact:', subscription.supportContact]);
    }

    if (subscription.cancelByNotes) {
      details.push(['Cancel-By Notes:', subscription.cancelByNotes]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: details,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Cancellation Steps (if available)
    if (subscription.cancellationSteps) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Cancellation Steps', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const steps = subscription.cancellationSteps.split('\n');
      steps.forEach(step => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(step, 14, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Timeline Section
    if (subscription.timeline.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Cancellation Timeline', 14, yPosition);
      yPosition += 8;

      const timelineData = subscription.timeline
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map(event => [
          format(new Date(event.timestamp), 'MMM d, yyyy h:mm a'),
          event.description,
          event.notes || '',
        ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Date/Time', 'Event', 'Notes']],
        body: timelineData,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 50 },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Proof Documents Section
    if (subscription.proofDocuments.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Proof Documents', 14, yPosition);
      yPosition += 8;

      const proofData = subscription.proofDocuments.map(proof => [
        proof.name,
        proof.type.toUpperCase(),
        format(new Date(proof.timestamp), 'MMM d, yyyy h:mm a'),
        proof.confirmationNumber || '-',
        proof.notes || '-',
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Document Name', 'Type', 'Added', 'Confirmation #', 'Notes']],
        body: proofData,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 40 },
          3: { cellWidth: 35 },
          4: { cellWidth: 'auto' },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // Add embedded images/files note
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('Note: File attachments are stored in CancelMem and can be accessed via the application.', 14, yPosition);
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount} - Generated by CancelMem`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Download the PDF
    const fileName = `CancelMem-${subscription.name.replace(/[^a-z0-9]/gi, '_')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  } catch {
    throw new Error('Unable to export PDF. Please try again.');
  }
}

export async function exportAllSubscriptionsProofBinder(subscriptions: Subscription[]): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title Page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CancelMem', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 12;
  doc.setFontSize(16);
  doc.text('Complete Proof Binder', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated on ${format(new Date(), 'PPP')}`, pageWidth / 2, yPosition, { align: 'center' });
  doc.text(`${subscriptions.length} subscription${subscriptions.length !== 1 ? 's' : ''}`, pageWidth / 2, yPosition + 6, { align: 'center' });
  
  doc.setTextColor(0);

  // Summary Table
  yPosition += 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, yPosition);
  yPosition += 8;

  const summaryData = subscriptions.map(sub => [
    sub.name,
    sub.status.toUpperCase(),
    format(new Date(sub.cancelByDate), 'MMM d, yyyy'),
    sub.proofStatus.toUpperCase(),
    sub.proofDocuments.length.toString(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Service', 'Status', 'Cancel By', 'Proof Status', 'Proof Count']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66], fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Individual subscription details
  subscriptions.forEach((subscription, index) => {
    doc.addPage();
    yPosition = 20;

    // Subscription header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${subscription.name}`, 14, yPosition);
    yPosition += 10;

    // Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const details = [
      ['Status:', subscription.status.toUpperCase()],
      ['Amount:', `${subscription.currency} ${subscription.amount.toFixed(2)} / ${subscription.billingPeriod}`],
      ['Cancel By Date:', format(new Date(subscription.cancelByDate), 'PPP')],
      ['Renewal Date:', format(new Date(subscription.renewalDate), 'PPP')],
      ['Proof Status:', subscription.proofStatus.toUpperCase()],
      ['Proof Documents:', subscription.proofDocuments.length.toString()],
    ];

    if (subscription.cancellationDate) {
      details.push(['Cancelled On:', format(new Date(subscription.cancellationDate), 'PPP')]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: details,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Timeline
    if (subscription.timeline.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Timeline', 14, yPosition);
      yPosition += 6;

      const timelineData = subscription.timeline
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10) // Limit to 10 most recent events
        .map(event => [
          format(new Date(event.timestamp), 'MMM d, h:mm a'),
          event.description,
        ]);

      autoTable(doc, {
        startY: yPosition,
        head: [],
        body: timelineData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
        },
      });
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} - CancelMem Binder`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download
  const fileName = `CancelMem-Complete-Binder-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}