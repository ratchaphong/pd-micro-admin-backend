import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientProxyModule } from './client-proxy/client-proxy.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ClientProxyModule,
    ProductModule,
  ],
})
export class AppModule {}
