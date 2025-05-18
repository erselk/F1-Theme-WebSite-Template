export function getFileUrl(fileId: string): string {
  return `/api/files/${fileId}`;
}

export function getImageUrl(fileId: string): string {
  return `/images/${fileId}`;
}