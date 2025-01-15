import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect } from 'mongoose';

let mongoMemoryServer: MongoMemoryServer;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      return {
        uri,
        ...options,
      };
    },
  });

export const closeMongoConnection = async () => {
  await disconnect();
  if (mongoMemoryServer) await mongoMemoryServer.stop();
};
