import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    async createCategory(dto: CreateCategoryDto) {
        // Check for duplicate name or slug
        const existing = await this.prisma.category.findFirst({
            where: {
                OR: [{ name: dto.name }, { slug: dto.slug }],
                deletedAt: null,
            },
        });

        if (existing) throw new ConflictException('Category with this name or slug already exists');

        return this.prisma.category.create({ data: dto });
    }

    async findAllCategories() {
        return this.prisma.category.findMany({
            where: { deletedAt: null },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        })
    }

    async findCategoryById(id: string) {
        const category = await this.prisma.category.findFirst({
            where: { id, deletedAt: null },
        });
        if (!category) throw new NotFoundException('Category not found');

        return category;
    }

    async updateCategory(id: string, dto: CreateCategoryDto) {
        // Check for duplicate name or slug (excluding current category)
        const existing = await this.prisma.category.findFirst({
            where: {
                OR: [{ name: dto.name }, { slug: dto.slug }],
                deletedAt: null,
                NOT: { id },
            },
        });

        if (existing) throw new ConflictException('Category with this name or slug already exists');

        return this.prisma.category.update({
            where: { id },
            data: dto,
        });
    }

    async deleteCategory(id: string) {
        // Check if category exists
        await this.findCategoryById(id);

        return this.prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
