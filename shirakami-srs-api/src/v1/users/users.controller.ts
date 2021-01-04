import { Controller, Get, UseGuards } from '@nestjs/common';
import { JWTGuard } from '../authentication/guards/jwt.guard';
import { User } from '../common/user.decorator';
import { UserEntity } from './entities/user.entity';
import { SetDto } from '../sets/dtos/set.dto';
import { UserResponseDto } from './dtos/userResponseDto';

@Controller()
export class UsersController {
  @Get('me')
  @UseGuards(JWTGuard)
  async findMe(@User() user: UserEntity): Promise<UserResponseDto> {
    return UserResponseDto.fromEntity(user);
  }
}
