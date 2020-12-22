import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokensService } from './tokens.service';
import { AuthResponseDTO } from './dtos/auth-response.dto';
import { RegisterRequestDTO } from './dtos/register-request.dto';
import { LoginRequestDTO } from './dtos/login-request.dto';
import { RefreshRequestDTO } from './dtos/refresh-request.dto';

@Controller()
export class AuthenticationController {
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
  ) {}

  @Post('/register')
  public async register(
    @Body() body: RegisterRequestDTO,
  ): Promise<AuthResponseDTO> {
    const user = await this.usersService.create(body);

    const accessToken = await this.tokensService.generateAccessToken(user);
    const refreshToken = await this.tokensService.generateRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Post('/login')
  public async login(@Body() body: LoginRequestDTO): Promise<AuthResponseDTO> {
    const { email, password } = body;
    const user = await this.usersService.findByEmail(email, true);
    const valid = user
      ? await this.usersService.validateCredentials(user, password)
      : false;

    if (!valid)
      throw new UnauthorizedException('The provided credentials are invalid');

    const accessToken = await this.tokensService.generateAccessToken(user);
    const refreshToken = await this.tokensService.generateRefreshToken(user);

    user.passwordHash = undefined;
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Post('/refresh')
  public async refresh(
    @Body() body: RefreshRequestDTO,
  ): Promise<AuthResponseDTO> {
    const {
      user,
      accessToken,
      refreshToken,
    } = await this.tokensService.refreshTokens(
      body.accessToken,
      body.refreshToken,
    );
    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
