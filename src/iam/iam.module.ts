// src/iam/iam.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { IamService } from './iam.service';
import { IamController } from './iam.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [IamController],
  providers: [IamService],
  exports: [IamService],
})
export class IamModule {}