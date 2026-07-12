import { ConflictException, Injectable } from '@nestjs/common';
import { user } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    // Find user by email (for login validation)
    async findByEmail(email: string): Promise<user | null> {
        return this.prisma.user.findUnique({ where: { email } })
    }

    // find user by id (for jwt vaidation)
    async findUserById(id: string) {
        return this.prisma.user.findUnique({ where: { id } })
    }

    // ccreate new user
    async createNewUser(
        email: string,
        password: string,
        firstName: string,
        lastName: string) {
        // Check if user already exists
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash the password 
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create the user in the database
        const user = await this.prisma.user.create({
            data: {
                email,
                password: passwordHash,
                firstName,
                lastName,
                role: 'CUSTOMER', // Default role
            },
        });

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Validate user credentials (for login)
    async validateUser(email: string, password: string) {
        const user = await this.findByEmail(email);
        if (!user || !user.password) {
            return null;
        }

        // Compare the provided password 
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        // Exclude passwordHash from the returned object
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async createOAuthUser(data: { googleId: string; email: string; firstName: string; lastName: string }) {
        // Check if user already exists (paranoid safety)
        const existing = await this.findByEmail(data.email);
        if (existing) {
            throw new ConflictException('User with this email already exists');
        }

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                googleId: data.googleId,
                firstName: data.firstName,
                lastName: data.lastName,
                password: null as any, // No password for OAuth users
                role: 'CUSTOMER',
            } as any,
        });

        const { password, ...result } = user;
        return result;
    }

    // Optionally, to link a Google account to an existing user (advanced)
    async linkGoogleId(userId: string, googleId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { googleId } as any,
        });
    }
}
