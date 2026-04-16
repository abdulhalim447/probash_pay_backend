import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('user/register')
  @ApiOperation({ summary: 'User Registration' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: '01712345678' },
        pin: { type: 'string', example: '123456' },
        fullName: { type: 'string', example: 'John Doe' },
      },
      required: ['phone', 'pin', 'fullName'],
    },
  })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'Phone already registered' })
  userRegister(
    @Body() body: { phone: string; pin: string; fullName: string },
  ) {
    return this.authService.userRegister(body.phone, body.pin, body.fullName);
  }

  @Post('user/login')
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: '01712345678' },
        pin: { type: 'string', example: '123456' },
      },
      required: ['phone', 'pin'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful with JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  userLogin(@Body() body: { phone: string; pin: string }) {
    return this.authService.userLogin(body.phone, body.pin);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin Login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@probashpay.com' },
        password: { type: 'string', example: 'Admin@123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Admin login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.adminLogin(body.email, body.password);
  }

  @Post('user/verify-pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Verify user PIN (for authenticated sessions)' })
  @ApiResponse({ status: 200, description: 'PIN verification successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized / Invalid PIN' })
  verifyUserPin(@Req() req: any, @Body() dto: VerifyPinDto) {
    return this.authService.verifyUserPin(req.user.id, dto.pin);
  }

  @Post('admin/seed')
  @ApiOperation({ summary: 'Create default admin account (run once)' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  seedAdmin() {
    return this.authService.seedAdmin();
  }
}
