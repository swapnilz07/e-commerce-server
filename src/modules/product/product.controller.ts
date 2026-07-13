import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { FilterProductDto } from './dto/filter-product.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('product')
@Controller('product')
export class ProductController {

    constructor(private readonly productService: ProductService) { }

    // --- PUBLIC ROUTES (No Auth Required) ---
    @Get()
    @ApiOperation({ summary: 'Get all products (public) with pagination and filters' })
    async findAll(@Query() filterDto: FilterProductDto) {
        return this.productService.findAllProducts(filterDto)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single product by ID (public)' })
    async findOne(@Param('id') id: string) {
        return this.productService.findProductById(id)
    }

    // --- PROTECTED ROUTES (Auth + RBAC Required) ---
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.VENDOR)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Create a new product (ADMIN or VENDOR only)" })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
    async create(@Req() req, @Body() createProductDto: CreateProductDto) {
        // req.user is attached by JwtAuthGuard via the JwtStrategy
        return this.productService.createProduct(req.user.id, createProductDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.VENDOR)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a product (ADMIN or the VENDOR who owns it)' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not the owner or insufficient role' })
    async update(
        @Req() req,
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productService.updateProduct(
            id,
            req.user.id,
            req.user.role,
            updateProductDto,
        );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.VENDOR)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a product (ADMIN or the VENDOR who owns it)' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not the owner or insufficient role' })
    async delete(@Req() req, @Param('id') id: string) {
        await this.productService.deleteProduct(id, req.user.id, req.user.role);
        return { message: 'Product deleted successfully' };
    }

    @Get('vendor/my-products')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all products created by the logged-in VENDOR' })
    async getMyProducts(@Req() req, @Query() filterDto: FilterProductDto) {
        return this.productService.findProductsByVendor(req.user.id, filterDto);
    }

}
