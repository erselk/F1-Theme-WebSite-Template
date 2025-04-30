/**
 * Client-safe utility functions for file handling
 */

/**
 * Creates a URL for accessing a file from the API
 * @param fileId The ID of the file
 * @returns The URL string
 */
export function getFileUrl(fileId: string): string {
  return `/api/files/${fileId}`;
}

/**
 * Creates a URL for accessing a file as an image
 * @param fileId The ID of the file
 * @returns The URL string
 */
export function getImageUrl(fileId: string): string {
  return `/images/${fileId}`;
}