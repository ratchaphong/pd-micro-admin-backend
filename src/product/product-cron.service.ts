// src/product/product-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ProductService } from './product.service';

@Injectable()
export class ProductCronService {
  private readonly logger = new Logger(ProductCronService.name);

  constructor(
    private readonly productService: ProductService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDeleteOldProductsCron() {
    const deletedCount = await this.productService.deleteOldSoftDeleted();
    this.logger.log(
      `🧹 Deleted ${deletedCount} soft-deleted products (older than 30 days)`,
    );
  }

  @Cron('*/15 * * * * *')
  handleLogEvery15Seconds() {
    const port = this.configService.get('PORT');
    const queue = this.configService.get('QUEUE_NAME');
    this.logger.log(
      `👋 Hello from ProductCronService | PORT: ${port} | QUEUE: ${queue}`,
    );
  }
}
