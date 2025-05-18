export const connectToDatabase = () => {
  return Promise.resolve(null);
};

export const MongoClient = {
  connect: () => {
    return Promise.resolve(null);
  }
};

export const GridFSBucket = class {
  constructor() {
    // Stub constructor
  }
};

export const ObjectId = (id: string) => {
  return id;
};

export default {
  connectToDatabase,
  MongoClient,
  GridFSBucket,
  ObjectId
};