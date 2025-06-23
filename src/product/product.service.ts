import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('CART_SERVICE') private readonly cartClient: ClientProxy,
  ) {}
  async validateUser(userId: string) {
    try {
      const result$ = this.userClient.send({ cmd: 'get-user-by-id' }, userId);
      const user = await firstValueFrom(result$);

      if (!user) throw new UnauthorizedException('User not found');
    } catch (err) {
      throw new UnauthorizedException('Unable to validate user');
    }
  }

  async getUserInfo(userId: string): Promise<UserResponseDto> {
    try {
      const result$ = this.userClient.send({ cmd: 'get-user-by-id' }, userId);
      const user = await firstValueFrom(result$);
      if (!user) throw new UnauthorizedException('User not found');

      return plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      throw new UnauthorizedException('Unable to get user info');
    }
  }

  async create(dto: CreateProductDto & { userId: string }) {
    await this.validateUser(dto.userId); // ✅ ตรวจสอบก่อน
    return this.prisma.product.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.product.findMany();
  }

  async search(params: {
    search: string;
    orderBy: 'createdAt' | 'price';
    order: 'asc' | 'desc';
    skip: number;
    take: number;
  }) {
    const { search, orderBy, order, skip, take } = params;

    return this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
        isDeleted: false,
      },
      orderBy: { [orderBy]: order },
      skip,
      take,
    });
    // WHERE
    // LOWER("name") LIKE '%phone%' OR
    // LOWER("description") LIKE '%phone%'
    // ORDER BY "price" ASC
    // OFFSET 10
    // LIMIT 5;
  }

  async getProductsForSale(
    sortMode: 'fifo' | 'lifo' | 'fefo' | 'newest' | 'price-asc' | 'price-desc',
    limit: number,
  ) {
    let orderBy: any;

    switch (sortMode) {
      case 'lifo': // Last In First Out - สินค้าที่ “เพิ่มล่าสุด” (ใหม่สุด) จะถูกแสดงก่อน (หรือขายก่อน)
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'fefo': // First Expired First Out – เรียงตามวันหมดอายุ
        orderBy = { price: 'expirationDate' };
        break;
      case 'fifo': // First In First Out – เรียงตามวันที่เพิ่มสินค้า
      default:
        orderBy = { createdAt: 'asc' };
        break;
    }

    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
        status: 'ACTIVE',
      },
      orderBy,
      take: limit,
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async softDelete(productId: string, userId: string): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
        isDeleted: false,
      },
    });

    if (!product) return false;

    // Soft delete product
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // แจ้ง cart-service ให้ soft delete ด้วย
    this.cartClient
      .send({ cmd: 'soft-delete-cart-by-product-id' }, productId)
      .subscribe((count) => {
        console.log(`Soft deleted ${count} cart items`);
      });

    return true;
  }

  async update(id: string, dto: UpdateProductDto, userId: string) {
    const existing = await this.prisma.product.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) return null;

    const user = await this.getUserInfo(userId);

    // ตรวจสอบสิทธิ์: ต้องเป็นเจ้าของ หรือ ไม่ใช่ USER
    const isOwner = user.id === existing.userId;
    const isPrivileged = user.role !== 'USER';

    if (!isOwner && !isPrivileged) {
      throw new UnauthorizedException(
        'You do not have permission to update this product',
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        // updatedAt: new Date(),
      },
    });
  }

  async deleteOldSoftDeleted(): Promise<number> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);

    const result = await this.prisma.product.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: threshold,
        },
      },
    });

    return result.count;
  }
}
