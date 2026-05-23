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
  @ApiOperation({ summary: 'ব্যবহারকারী রেজিস্ট্রেশন' })
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
  @ApiResponse({ status: 201, description: 'রেজিস্ট্রেশন সফল হয়েছে' })
  @ApiResponse({ status: 409, description: 'মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত' })
  userRegister(
    @Body() body: { phone: string; pin: string; fullName: string },
  ) {
    return this.authService.userRegister(body.phone, body.pin, body.fullName);
  }

  @Post('user/login')
  @ApiOperation({ summary: 'ব্যবহারকারী লগইন' })
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
  @ApiResponse({ status: 200, description: 'টোকেনসহ লগইন সফল হয়েছে' })
  @ApiResponse({ status: 401, description: 'ভুল মোবাইল নম্বর অথবা পিন' })
  userLogin(@Body() body: { phone: string; pin: string }) {
    return this.authService.userLogin(body.phone, body.pin);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'অ্যাডমিন লগইন' })
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
  @ApiResponse({ status: 200, description: 'অ্যাডমিন লগইন সফল হয়েছে' })
  @ApiResponse({ status: 401, description: 'ভুল ইমেল অথবা পাসওয়ার্ড' })
  adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.adminLogin(body.email, body.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'ব্যবহারকারীর অ্যাক্সেস এবং রিফ্রেশ টোকেন রিফ্রেশ করা' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({ status: 200, description: 'টোকেন সফলভাবে রিফ্রেশ হয়েছে' })
  @ApiResponse({ status: 401, description: 'অকার্যকর বা মেয়াদোত্তীর্ণ রিফ্রেশ টোকেন' })
  refreshTokens(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @Post('user/verify-pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'ব্যবহারকারীর পিন (PIN) যাচাই করা (লগইন থাকা অবস্থায়)' })
  @ApiResponse({ status: 200, description: 'পিন যাচাইকরণ সফল হয়েছে' })
  @ApiResponse({ status: 401, description: 'অননুমোদিত / ভুল পিন' })
  verifyUserPin(@Req() req: any, @Body() dto: VerifyPinDto) {
    return this.authService.verifyUserPin(req.user.id, dto.pin);
  }

  @Post('admin/seed')
  @ApiOperation({ summary: 'ডিফল্ট অ্যাডমিন অ্যাকাউন্ট তৈরি করা (একবার চালানোর জন্য)' })
  @ApiResponse({ status: 201, description: 'অ্যাডমিন সফলভাবে তৈরি হয়েছে' })
  seedAdmin() {
    return this.authService.seedAdmin();
  }
}
