
/**
 * Converts a File object to a base64 encoded string
 * @param file The file to convert
 * @returns A Promise that resolves with the base64 encoded string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Validates a file based on allowed extensions
 * @param file The file to validate
 * @param allowedExtensions Array of allowed file extensions (e.g. ['.pdf', '.jpg'])
 * @returns An object with validation result and error message if any
 */
export const validateFileExtension = (
  file: File, 
  allowedExtensions: string[]
): { isValid: boolean; errorMessage?: string } => {
  if (!file) return { isValid: false, errorMessage: 'No file selected' };
  
  const fileName = file.name.toLowerCase();
  const fileExtension = `.${fileName.split('.').pop()}`;
  
  if (!allowedExtensions.includes(fileExtension)) {
    return { 
      isValid: false, 
      errorMessage: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates file size
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB
 * @returns An object with validation result and error message if any
 */
export const validateFileSize = (
  file: File,
  maxSizeMB: number
): { isValid: boolean; errorMessage?: string } => {
  if (!file) return { isValid: false, errorMessage: 'No file selected' };
  
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > maxSizeMB) {
    return {
      isValid: false,
      errorMessage: `File size exceeds the maximum allowed size of ${maxSizeMB}MB`
    };
  }
  
  return { isValid: true };
};

/**
 * Creates a downloadable CSV template
 * @param headers Array of column headers
 * @param sampleData Array of sample data rows
 * @param filename Name for the downloaded file
 */
export const downloadCSVTemplate = (
  headers: string[],
  sampleData: string[][],
  filename: string
): void => {
  const headerRow = headers.join(',');
  const dataRows = sampleData.map(row => row.join(','));
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
