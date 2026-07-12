import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";



export class RegisterDto {
    @ApiProperty({ example: "john@example.com" })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @IsNotEmpty()
    password: string;
}