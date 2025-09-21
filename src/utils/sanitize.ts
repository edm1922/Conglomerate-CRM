export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
};