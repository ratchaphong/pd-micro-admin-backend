// src/product/entities/product.entity.ts
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '@prisma/client';

@Exclude()
export class ProductEntity implements Product {
  @Expose()
  @ApiProperty({
    example: 'c72f18da-e0d7-4b85-b2b0-85d0de33cffa',
    description: 'รหัสของสินค้า (UUID)',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'iPhone 15 Pro',
    description: 'ชื่อของสินค้า',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 42900,
    description: 'ราคาของสินค้า (บาท)',
  })
  price: number;

  @Expose()
  @ApiProperty({
    example: 'โทรศัพท์มือถือรุ่นล่าสุดจาก Apple พร้อมชิป A17',
    description: 'รายละเอียดสินค้า',
  })
  description: string;

  @Expose()
  @ApiProperty({
    example: '2025-06-19T13:00:00.000Z',
    description: 'วันเวลาที่สร้างสินค้า',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    example: '2025-06-19T15:45:00.000Z',
    description: 'วันเวลาที่มีการแก้ไขล่าสุด',
  })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    example: 'e4d909c2-5a61-4c0c-93c5-7fba13cde678',
    description: 'รหัสผู้ใช้ที่เป็นเจ้าของสินค้า (userId)',
  })
  userId: string;

  @Expose()
  @ApiProperty({
    example: false,
    description: 'สถานะการลบข้อมูลแบบ soft delete',
  })
  isDeleted: boolean;

  @Expose()
  @ApiProperty({
    example: null,
    description: 'วันที่ถูกลบ (เฉพาะเมื่อ isDeleted เป็น true)',
    nullable: true,
  })
  deletedAt: Date | null;

  @Expose()
  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'ลิงก์ภาพของสินค้า (optional)',
  })
  image: string | null;

  @Expose()
  @ApiProperty({
    example: 'ACTIVE',
    description: 'สถานะของสินค้า เช่น ACTIVE หรือ INACTIVE',
  })
  status: string;
}
