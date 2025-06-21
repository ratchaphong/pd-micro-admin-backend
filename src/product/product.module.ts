import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ClientProxyModule } from 'src/client-proxy/client-proxy.module';
import { ProductCronService } from './product-cron.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    ClientProxyModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductCronService, JwtStrategy],
})
export class ProductModule {}
