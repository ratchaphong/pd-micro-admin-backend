// src/product/dto/delete-product-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DeleteProductResponseDto {
  @Expose()
  @ApiProperty({ example: true })
  success: boolean;

  @Expose()
  @ApiProperty({ example: 'Product soft deleted' })
  message: string;
}
