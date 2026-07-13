import { IsString, IsNumber, IsOptional, Min, MaxLength, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'iPhone 15 Pro' })
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty({ example: 'The latest iPhone with titanium frame' })
    @IsString()
    @MaxLength(1000)
    description: string;

    @ApiProperty({ example: 999.99 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ example: 50 })
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ example: 'category-uuid-here' })
    @IsString()
    categoryId: string;

    @ApiProperty({ example: ['image1.jpg', 'image2.jpg'], required: false })
    @IsArray()
    @IsOptional()
    images?: string[];
}