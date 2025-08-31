import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No JWT token found');
    }

    const token = authHeader.split(' ')[1]; // Extract JWT token

    const secret = this.configService.get<string>('AUTH_JWT_SECRET');

    try {
      // Use the secret key for verification (use your actual secret)
      const payload = this.jwtService.verify(token, {
        secret: secret, // Use the environment variable
      });
      request.user = payload; // Attach the user to the request object
      return true;
    } catch (err) {
      console.error('JWT Verification Error:', err);
      throw new UnauthorizedException('Invalid JWT token');
    }
  }
}
