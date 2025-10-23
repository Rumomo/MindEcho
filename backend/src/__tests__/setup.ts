import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test_jwt_secret';
  process.env.ACCESS_TOKEN_SECRET = 'test_access_token_secret';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});