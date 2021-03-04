import { Controller, Get, UseGuards } from '@nestjs/common';
import { JWTGuard } from '../authentication/guards/jwt.guard';
import { User } from '../common/decorators/user.decorator';
import { UserEntity } from './entities/user.entity';
import { UserResponseDto } from './dtos/userResponseDto';

@Controller()
export class UsersController {
  @Get('me')
  @UseGuards(JWTGuard)
  async findMe(@User() user: UserEntity): Promise<UserResponseDto> {
    return UserResponseDto.fromEntity(user);
  }
}
