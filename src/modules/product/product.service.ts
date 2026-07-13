import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { Product, UserRole, } from '@prisma/client';

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) { }

    // --- HELPER: Check if Category exists ---
    private async validateCategory(categoryId: string) {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId, deletedAt: null },
        });
        if (!category) {
            throw new BadRequestException(`Category with ID ${categoryId} does not exist`);
        }
        return category;
    }

    // Create a product (ADMIN or VENDOR)
    async createProduct(userId: string, createProductDto: CreateProductDto): Promise<Product> {
        // Validate that the category exists
        await this.validateCategory(createProductDto.categoryId);

        return this.prisma.product.create({
            data: {
                name: createProductDto.name,
                description: createProductDto.description,
                price: createProductDto.price,
                stock: createProductDto.stock,
                images: createProductDto.images || [],
                categoryId: createProductDto.categoryId,
                vendorId: userId,
            },
            include: {
                category: true, // Include category details in the response
                vendor: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
    }

    // Get all products with pagination and filtering (Q15)
    async findAllProducts(filterDto: FilterProductDto) {
        const { categoryId, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = filterDto;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            deletedAt: null, // Only show non-deleted products
        };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Get total count for pagination metadata
        const total = await this.prisma.product.count({ where });

        // Get paginated results
        const data = await this.prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                category: true, // <-- Include full category object
                vendor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Get a single product by ID
    async findProductById(id: string): Promise<Product> {
        const product = await this.prisma.product.findFirst({
            where: { id, deletedAt: null },
            include: {
                category: true,
                vendor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    // Update a product (Only ADMIN or the VENDOR who owns it)
    async updateProduct(
        productId: string,
        userId: string,
        userRole: UserRole,
        updateProductDto: UpdateProductDto,
    ): Promise<Product> {
        // First, find the product
        const product = await this.findProductById(productId);

        // Check permissions: ADMIN can update anything, VENDOR can only update their own
        if (userRole !== UserRole.ADMIN && product.vendorId !== userId) {
            throw new ForbiddenException('You are not authorized to update this product');
        }

        // If categoryId is being updated, validate the new category
        if (updateProductDto.categoryId) {
            await this.validateCategory(updateProductDto.categoryId);
        }

        return this.prisma.product.update({
            where: { id: productId },
            data: updateProductDto,
            include: {
                category: true,
                vendor: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
    }

    // Delete a product (Soft Delete - Bonus #48)
    async deleteProduct(productId: string, userId: string, userRole: UserRole): Promise<void> {
        const product = await this.findProductById(productId);

        // Check permissions: ADMIN can delete anything, VENDOR can only delete their own
        if (userRole !== UserRole.ADMIN && product.vendorId !== userId) {
            throw new ForbiddenException('You are not authorized to delete this product');
        }

        // Soft delete: Set deletedAt timestamp instead of hard deleting
        await this.prisma.product.update({
            where: { id: productId },
            data: { deletedAt: new Date() },
        });
    }

    // Get products by vendor (for VENDOR dashboard)
    async findProductsByVendor(vendorId: string, filterDto: FilterProductDto) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', categoryId, search } = filterDto;
        const skip = (page - 1) * limit;

        const where: any = {
            vendorId,
            deletedAt: null,
        };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const total = await this.prisma.product.count({ where });
        const data = await this.prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                category: true,
            },
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}