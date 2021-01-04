import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokensService } from './tokens.service';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { LoginRequestDto } from './dtos/login-request.dto';
import { RefreshRequestDto } from './dtos/refresh-request.dto';
import { UserEntity } from '../users/entities/user.entity';

@Controller()
export class AuthenticationController {
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
  ) {}

  @Post('/register')
  public async register(
    @Body() body: RegisterRequestDto,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.create(body);

    const accessToken = await this.tokensService.generateAccessToken(user);
    const refreshToken = await this.tokensService.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('/login')
  public async login(@Body() body: LoginRequestDto): Promise<AuthResponseDto> {
    const { email, password } = body;
    const user = await this.usersService.findByEmail(email, true).catch((e) => {
      if (e instanceof NotFoundException) return null;
      throw e;
    });
    const valid = user
      ? await this.usersService.validateCredentials(user, password)
      : false;

    if (!valid)
      throw new UnauthorizedException('The provided credentials are invalid');

    const accessToken = await this.tokensService.generateAccessToken(user);
    const refreshToken = await this.tokensService.generateRefreshToken(user);

    user.passwordHash = undefined;
    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('/refresh')
  public async refresh(
    @Body() body: RefreshRequestDto,
  ): Promise<AuthResponseDto> {
    const {
      accessToken,
      refreshToken,
    } = await this.tokensService.refreshTokens(
      body.accessToken,
      body.refreshToken,
    );
    return {
      accessToken,
      refreshToken,
    };
  }
}
