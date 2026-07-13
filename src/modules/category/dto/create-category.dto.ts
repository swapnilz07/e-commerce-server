import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";


export class CreateCategoryDto {
    @ApiProperty({ example: "Electronics" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @ApiProperty({ example: 'electronics' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    slug: string;  // e.g., "electronics"

    @ApiProperty({ example: 'All electronic devices', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    description?: string;
}