/**
 * This is a stub implementation of MongoDB for client-side code.
 * It prevents errors when browser code accidentally imports MongoDB modules.
 */

// Export empty/stub versions of MongoDB functionality that might be imported on the client side
export const connectToDatabase = () => {
  console.error('MongoDB cannot be used on the client side. Please use server components or API routes.');
  return Promise.resolve(null);
};

export const MongoClient = {
  connect: () => {
    console.error('MongoDB cannot be used on the client side. Please use server components or API routes.');
    return Promise.resolve(null);
  }
};

// Stub for GridFSBucket and related functionality
export const GridFSBucket = class {
  constructor() {
    console.error('MongoDB GridFSBucket cannot be used on the client side.');
    return null;
  }
};

export const ObjectId = (id: string) => {
  console.error('MongoDB ObjectId cannot be used on the client side.');
  return id;
};

// Export a stub for any other MongoDB functionality that might be imported
export default {
  connectToDatabase,
  MongoClient,
  GridFSBucket,
  ObjectId
};