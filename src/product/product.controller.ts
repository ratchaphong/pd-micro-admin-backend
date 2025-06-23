import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  Query,
  Delete,
  NotFoundException,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { ProductEntity } from './entities/product.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SearchProductDto } from './dto/search-product.dto';
import { DeleteProductResponseDto } from './dto/delete-product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PublicProductQueryDto } from './dto/public-product-query.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @MessagePattern({ cmd: 'get-product-by-id' })
  getProductById(id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: 'Create a product',
    description: 'Creates a new product and returns the created product data.',
  })
  @ApiCreatedResponse({ description: 'Product created', type: ProductEntity })
  async create(@Body() dto: CreateProductDto, @Req() req: any) {
    const userId = req.user.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    console.log(userId);

    const product = await this.service.create({ ...dto, userId });
    return plainToInstance(ProductEntity, product);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiOkResponse({
    description: 'List of all products',
    type: ProductEntity,
    isArray: true,
  })
  async findAll() {
    const products = await this.service.findAll();
    return products.map((p) => plainToInstance(ProductEntity, p));
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products with filters' })
  @ApiOkResponse({
    description: 'Filtered and paginated list of products',
    type: ProductEntity,
    isArray: true,
  })
  async search(@Query() query: SearchProductDto) {
    const {
      search = '',
      orderBy = 'createdAt',
      order = 'desc',
      page = '1',
      perPage = '10',
    } = query;

    const pageNumber = parseInt(page, 10);
    const limit = parseInt(perPage, 10);
    const skip = (pageNumber - 1) * limit;

    const products = await this.service.search({
      search,
      orderBy,
      order,
      skip,
      take: limit,
    });

    return products.map((p) => plainToInstance(ProductEntity, p));
  }

  @Get('public')
  @ApiOperation({ summary: 'Get products for public sale' })
  @ApiOkResponse({
    description: 'List of products for sale',
    type: ProductEntity,
    isArray: true,
  })
  async getPublicProducts(@Query() query: PublicProductQueryDto) {
    const { sortMode = 'fifo', limit = 20 } = query;
    const products = await this.service.getProductsForSale(sortMode, limit);
    return products.map((p) => plainToInstance(ProductEntity, p));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiOkResponse({ description: 'Found the product', type: ProductEntity })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    const product = await this.service.findOne(id);
    return plainToInstance(ProductEntity, product);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiOkResponse({
    description: 'Product soft deleted successfully',
    type: DeleteProductResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async softDelete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const success = await this.service.softDelete(id, userId);
    if (!success) {
      throw new NotFoundException('Product not found or not owned by user');
    }

    return plainToInstance(DeleteProductResponseDto, {
      success: true,
      message: 'Product soft deleted',
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({
    summary: 'Update product',
    description:
      'Only the product owner or users with elevated roles (STAFF/ADMIN) can update a product.',
  })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: ProductEntity,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const updated = await this.service.update(id, dto, userId);
      return plainToInstance(ProductEntity, updated);
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw new ForbiddenException(
          'You are not allowed to update this product',
        );
      }

      throw new NotFoundException('Product not found');
    }
  }

  @Delete('clean-deleted')
  @ApiOperation({
    summary: 'Delete products soft-deleted more than 30 days ago',
  })
  @ApiOkResponse({
    description: 'Deleted products permanently',
    type: DeleteProductResponseDto,
  })
  async deleteOldSoftDeleted() {
    const deletedCount = await this.service.deleteOldSoftDeleted();
    return plainToInstance(DeleteProductResponseDto, {
      success: true,
      message: `${deletedCount} product(s) permanently deleted`,
    });
  }
}
