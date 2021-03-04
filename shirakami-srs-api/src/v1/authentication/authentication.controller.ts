import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokensService } from './tokens.service';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { LoginRequestDto } from './dtos/login-request.dto';
import { RefreshRequestDto } from './dtos/refresh-request.dto';
import { RegisterResponseDto } from './dtos/register-response.dto';
import { ConfigService } from '@nestjs/config';
import { EmailVerificationTokenPayload } from './interfaces/token-payload.interface';
import { MailService } from '../common/mail.service';

@Controller()
export class AuthenticationController {
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  @Post('/register')
  public async register(
    @Body() body: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const user = await this.usersService.create(body);
    if (!user.emailVerified) {
      const activationToken = await this.tokensService.generateEmailVerificationToken(
        user,
      );
      const activationUrl = `${this.configService.get<string>(
        'APP_BASE_URL',
      )}/emailverification?token=${activationToken}`;
      try {
        await this.mailService.sendEmailVerification(
          user.email,
          user.username,
          activationUrl,
        );
      } catch (e) {
        console.error(e);
        try {
          await this.usersService.remove(user.id);
        } catch (e) {
          console.error(e);
        }
        throw new InternalServerErrorException(
          'Could not send verification email. Check the logs.',
          'MAILER_FAILED',
        );
      }
      console.log(
        `User registered (${user.email}). To activate the account, visit ${activationUrl}`,
      );
    }
    return { success: true, needsEmailVerification: !user.emailVerified };
  }

  @Get('/verify')
  public async verify(@Query('token') token: string, @Res() res) {
    // Parse the token
    let payload;
    try {
      payload = await this.tokensService.decodeToken<EmailVerificationTokenPayload>(
        token,
        'email verification',
      );
    } catch (e) {
      if (e instanceof UnprocessableEntityException) {
        const resp = e.getResponse();
        const code: string =
          typeof resp === 'object' ? (resp as any).error : resp;
        return res.redirect(
          `${this.configService.get(
            'APP_BASE_URL',
          )}/emailverification?status=${code}`,
        );
      } else {
        console.error(e);
        return res.redirect(
          `${this.configService.get(
            'APP_BASE_URL',
          )}/emailverification?status=UNKNOWN_ERROR`,
        );
      }
    }
    // Get the user for the token
    const user = await this.usersService.findById(payload.userId);
    // Check if the user already has their email verified
    if (user.emailVerified)
      return res.redirect(
        `${this.configService.get(
          'APP_BASE_URL',
        )}/emailverification?status=ALREADY_VERIFIED`,
      );
    // Check if the email address to verify matches the users email address
    if (user.email !== payload.email)
      return res.redirect(
        `${this.configService.get(
          'APP_BASE_URL',
        )}/emailverification?status=EMAIL_NO_MATCH`,
      );
    // Mark the user's email address as verified
    await this.usersService.verifyEmail(user.id);
    return res.redirect(
      `${this.configService.get(
        'APP_BASE_URL',
      )}/emailverification?status=SUCCESS`,
    );
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
      throw new UnauthorizedException(
        'The provided credentials are invalid',
        'INVALID_CREDENTIALS',
      );
    if (
      !user.emailVerified &&
      this.configService.get<boolean>('EMAIL_VERIFICATION')
    ) {
      throw new ForbiddenException(
        'This account is still inactive because its email address has not yet been verified.',
        'EMAIL_NOT_VERIFIED',
      );
    }
    const accessToken = await this.tokensService.generateAccessToken(user);
    const refreshToken = await this.tokensService.generateRefreshToken(user);
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
