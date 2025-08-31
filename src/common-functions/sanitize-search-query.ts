 // Helper method to sanitize the search query
 export function sanitizeSearchQuery(search?: string): string | undefined {
    if (!search) {
      return undefined;
    }

    // Decode URI components and trim the string
    search = decodeURIComponent(search).trim();

    // Handle cases where search contains only double quotes or is empty
    if (search === `""` || search === `''` || search.length === 0) {
      return undefined;
    }

    return search;
  }
