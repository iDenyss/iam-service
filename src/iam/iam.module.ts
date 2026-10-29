// src/iam/iam.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { IamService } from './iam.service';
import { IamController } from './iam.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [IamController],
  providers: [IamService],
  exports: [IamService],
})
export class IamModule {}