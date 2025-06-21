import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 15 Pro',
    description: 'ชื่อของสินค้า',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'โทรศัพท์มือถือรุ่นล่าสุดจาก Apple พร้อมชิป A17',
    description: 'รายละเอียดสินค้า',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 42900,
    description: 'ราคาของสินค้า (บาท)',
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'สถานะของสินค้า เช่น ACTIVE หรือ INACTIVE',
  })
  @IsString()
  status: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'ลิงก์ภาพของสินค้า (optional)',
  })
  @IsOptional()
  @IsString()
  image?: string;

  // @ApiPropertyOptional({
  //   example: 'e4d909c2-5a61-4c0c-93c5-7fba13cde678',
  //   description: 'รหัสผู้ใช้ที่เป็นเจ้าของสินค้า (userId)',
  // })
  // @IsOptional()
  // @IsString()
  // userId?: string;
}
