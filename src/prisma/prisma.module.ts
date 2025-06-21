import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // ทำให้ใช้ได้ทุก module โดยไม่ต้อง import ซ้ำ
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
