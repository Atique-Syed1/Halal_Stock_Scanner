import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Convert oklch colors to rgb for html2canvas compatibility
const convertOklchToRgb = (element) => {
  const clone = element.cloneNode(true);
  const allElements = clone.querySelectorAll('*');
  
  const convertColor = (color) => {
    if (!color || !color.includes('oklch')) return color;
    // Replace oklch colors with fallback hex colors
    const colorMap = {
      'oklch(0.723 0.219 149.579)': '#10b981', // emerald-500
      'oklch(0.765 0.177 163.223)': '#34d399', // emerald-400
      'oklch(0.627 0.258 29.234)': '#ef4444',  // red-500
      'oklch(0.704 0.191 22.216)': '#f87171',  // red-400
      'oklch(0.577 0.245 27.325)': '#dc2626',  // red-600
      'oklch(0.551 0.027 264.364)': '#6b7280', // gray-500
      'oklch(0.446 0.03 256.802)': '#4b5563',  // gray-600
      'oklch(0.373 0.034 259.733)': '#374151', // gray-700
      'oklch(0.278 0.033 256.848)': '#1f2937', // gray-800
      'oklch(0.21 0.034 264.665)': '#111827',  // gray-900
    };
    
    for (const [oklch, hex] of Object.entries(colorMap)) {
      if (color.includes(oklch.slice(0, 20))) {
        return hex;
      }
    }
    return '#333333'; // Default fallback
  };
  
  allElements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.color?.includes('oklch')) {
      el.style.color = convertColor(style.color);
    }
    if (style.backgroundColor?.includes('oklch')) {
      el.style.backgroundColor = convertColor(style.backgroundColor);
    }
    if (style.borderColor?.includes('oklch')) {
      el.style.borderColor = convertColor(style.borderColor);
    }
  });
  
  return clone;
};

const ChartExport = ({ chartRef, filename = 'chart', title = '' }) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const exportToPNG = async () => {
    if (!chartRef?.current) return;
    
    setIsExporting(true);
    try {
      // Create a temporary container with fixed colors
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.backgroundColor = '#1f2937';
      
      const clone = chartRef.current.cloneNode(true);
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);
      
      const canvas = await html2canvas(clone, {
        backgroundColor: '#1f2937',
        scale: 2,
        logging: false,
        useCORS: true,
        removeContainer: false,
        // Ignore oklch color parsing errors
        onclone: (clonedDoc, element) => {
          const style = document.createElement('style');
          style.textContent = `
            * { 
              color: inherit !important;
              background-color: inherit !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      document.body.removeChild(tempContainer);
      
      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
      // Fallback: try to export without color processing
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#1f2937',
          scale: 2,
          logging: false,
          useCORS: true,
          ignoreElements: (element) => {
            return element.tagName === 'STYLE';
          }
        });
        const link = document.createElement('a');
        link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (fallbackError) {
        console.error('Fallback export also failed:', fallbackError);
        alert('Export failed. The chart uses modern CSS colors not supported by the export library.');
      }
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const exportToPDF = async () => {
    if (!chartRef?.current) return;
    
    setIsExporting(true);
    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.backgroundColor = '#1f2937';
      
      const clone = chartRef.current.cloneNode(true);
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);
      
      const canvas = await html2canvas(clone, {
        backgroundColor: '#1f2937',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      document.body.removeChild(tempContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height + 60],
      });
      
      // Add title
      if (title) {
        pdf.setFontSize(20);
        pdf.setTextColor(51, 51, 51);
        pdf.text(title, 20, 30);
      }
      
      // Add chart
      pdf.addImage(imgData, 'PNG', 0, title ? 50 : 0, canvas.width, canvas.height);
      
      // Add footer with date
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} - Halal Trade Scanner`,
        20,
        canvas.height + (title ? 55 : 10)
      );
      
      pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('PDF export failed. The chart uses modern CSS colors not supported by the export library.');
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg
                   bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                   text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50"
        aria-label={t('export.title')}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{t('export.downloading')}</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{t('export.title')}</span>
          </>
        )}
      </button>

      {showMenu && !isExporting && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg shadow-lg bg-white dark:bg-gray-800 
                        ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
          <div className="py-1">
            <button
              onClick={exportToPNG}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('export.png')}
            </button>
            <button
              onClick={exportToPDF}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {t('export.pdf')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartExport;
