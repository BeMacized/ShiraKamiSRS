import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserEntity, UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string, includePasswordHash = false): Promise<UserEntity> {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException();
    if (!includePasswordHash) user.passwordHash = undefined;
    return user;
  }

  async findByEmail(
    email: string,
    includePasswordHash = false,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ email });
    if (!user) throw new NotFoundException();
    if (!includePasswordHash) user.passwordHash = undefined;
    return user;
  }

  async findByUsername(username: string): Promise<UserEntity[]> {
    return this.userRepository.find({ username });
  }

  async create(userData: CreateUserEntity): Promise<UserEntity> {
    // Check if user with email already exists
    try {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser)
        throw new ConflictException(
          null,
          'A user with this email already exists',
        );
    } catch (e) {
      if (!(e instanceof NotFoundException)) throw e;
    }
    // Determine a discriminator for the user
    const users = await this.findByUsername(userData.username);
    const usedDiscriminators = users.map((u) => u.discriminator);
    let discriminator;
    for (let i = 0; i < 10; i++) {
      discriminator = Math.floor(Math.random() * (10000 - 1)) + 1;
      if (!usedDiscriminators.includes(discriminator)) break;
      discriminator = null;
    }
    if (!discriminator)
      throw new ConflictException(
        null,
        'This username has been used too often',
      );
    // Hash the password
    const passwordHash = await bcrypt.hash(userData.password, 10);
    // Create the user
    const user = await this.userRepository.save({
      email: userData.email,
      username: userData.username,
      discriminator,
      passwordHash,
    });
    user.passwordHash = undefined;
    return user;
  }

  async validateCredentials(
    user: UserEntity,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
