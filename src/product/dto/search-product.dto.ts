// src/product/dto/search-product.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class SearchProductDto {
  @ApiPropertyOptional({ description: 'คำค้นหา', example: 'iPhone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'เรียงตาม field',
    example: 'price',
    enum: ['createdAt', 'price'],
  })
  @IsOptional()
  @IsEnum(['createdAt', 'price'])
  orderBy?: 'createdAt' | 'price';

  @ApiPropertyOptional({
    description: 'ลำดับการเรียง',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'หมายเลขหน้า', example: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ description: 'จำนวนรายการต่อหน้า', example: 10 })
  @IsOptional()
  @IsNumberString()
  perPage?: string;
}
