import { Mongoose } from 'mongoose';
import { MongoClient, Db } from 'mongodb';

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
  var mongoClient: {
    conn: MongoClient | null;
    promise: Promise<MongoClient> | null;
  };
  var mongoDb: Db | null;
}

export {}; 