<div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Full Document</h2>
  <div className="bg-gradient-to-br from-navy/5 to-accent/5 rounded-lg p-8 text-center border-2 border-dashed border-navy/20">
    <FileText className="mx-auto text-navy mb-4" size={64} />
    <p className="text-gray-700 dark:text-gray-300 mb-2 font-semibold">
      Protected Research Document
    </p>
    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
      Click to view the full PDF document
    </p>
    
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={() => setShowPDF(true)}
        className="inline-flex items-center justify-center gap-2 bg-navy text-white px-8 py-3 rounded-lg hover:bg-navy-800 transition shadow-md"
      >
        <FileText size={20} />
        View PDF
      </button>
      
      
       <a href={paper.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition shadow-md"
      >
        <ExternalLink size={20} />
        Open in New Tab
      </a>
    </div>
    
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
      🔒 All views are logged and watermarked
    </p>
  </div>
</div>