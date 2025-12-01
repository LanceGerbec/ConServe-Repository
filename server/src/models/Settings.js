{/* Add PDF Viewer Modal at the end, before the closing div */}
{showPDF && (
  <PDFViewer 
    pdfUrl={paper.fileUrl} 
    paperTitle={paper.title}
    onClose={() => setShowPDF(false)}
  />
)}