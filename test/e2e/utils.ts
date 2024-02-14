export const removeRedundantText = (str?: string | null) => {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
};
