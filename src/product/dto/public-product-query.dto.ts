import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsNumberString } from 'class-validator';

export class PublicProductQueryDto {
  @ApiPropertyOptional({
    enum: ['fifo', 'lifo', 'newest', 'price-asc', 'price-desc'],
    default: 'fifo',
  })
  @IsOptional()
  @IsIn(['fifo', 'lifo', 'newest', 'price-asc', 'price-desc'])
  sortMode?: 'fifo' | 'lifo' | 'newest' | 'price-asc' | 'price-desc' = 'fifo';

  @ApiPropertyOptional({ type: Number, default: 20 })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;
}
