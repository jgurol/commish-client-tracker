// Utility functions for timezone-aware date handling
export const getAppTimezone = (): string => {
  return localStorage.getItem('app_timezone') || 'America/Los_Angeles';
};

// Format date for input field (YYYY-MM-DD) using the app's configured timezone
export const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return "";
  
  console.log("[formatDateForInput] Input dateString:", dateString);
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    console.log("[formatDateForInput] Already in YYYY-MM-DD format, returning:", dateString);
    return dateString;
  }
  
  try {
    const timezone = getAppTimezone();
    console.log("[formatDateForInput] Using timezone:", timezone);
    
    // Parse the date and format it in the configured timezone
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.log("[formatDateForInput] Invalid date, returning empty string");
      return "";
    }
    
    // Format the date in the configured timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const result = formatter.format(date);
    console.log("[formatDateForInput] Formatted result:", result);
    return result;
  } catch (error) {
    console.error("[formatDateForInput] Error formatting date:", error);
    return "";
  }
};

// Create a date string from input (keeps it in YYYY-MM-DD format)
export const createDateString = (inputValue: string): string => {
  console.log("[createDateString] Input value:", inputValue);
  if (!inputValue) return "";
  
  // Return the input value as-is since it's already in YYYY-MM-DD format
  console.log("[createDateString] Returning:", inputValue);
  return inputValue;
};

// Get today's date in the configured timezone as YYYY-MM-DD
export const getTodayInTimezone = (): string => {
  const timezone = getAppTimezone();
  const today = new Date();
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  return formatter.format(today);
};
