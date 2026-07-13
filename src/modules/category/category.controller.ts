import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('Categories')
@Controller('category')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Only Admins can manage categories
@ApiBearerAuth()
export class CategoryController {

    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return this.categoryService.createCategory(dto);
    }

    @Get()
    findAll() {
        return this.categoryService.findAllCategories();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoryService.findCategoryById(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
        return this.categoryService.updateCategory(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoryService.deleteCategory(id);
    }
}
