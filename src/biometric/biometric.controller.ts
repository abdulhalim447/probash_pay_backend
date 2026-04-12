import {
  Controller, Get, Post, Delete,
  Param, Body, Req,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BiometricService } from './biometric.service';
import { RegisterBiometricDto } from './dto/register-biometric.dto';
import { VerifyBiometricDto } from './dto/verify-biometric.dto';

@ApiTags('Biometric Auth')
@Controller('biometric')
export class BiometricController {
  constructor(private readonly biometricService: BiometricService) {}

  // ─── GET challenge for setup (logged-in user) ───
  @Get('challenge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ 
    summary: 'Get challenge for fingerprint setup',
    description: 'Phase 1 of Registration: Generates a random challenge for the logged-in user to sign with their new biometric private key. Valid for 5 minutes.'
  })
  @ApiResponse({ status: 200, description: 'Challenge generated successfully', schema: { example: { challengeId: 'uuid', challenge: 'base64-string' } } })
  @ApiResponse({ status: 401, description: 'Unauthorized - User must be logged in with PIN first' })
  async getChallenge(@Req() req: any) {
    return this.biometricService.getChallenge(req.user.sub);
  }

  // ─── POST register fingerprint (logged-in user) ───
  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Complete fingerprint registration',
    description: 'Phase 2 of Registration: Receives the signed challenge and public key from the device. Verifies the signature and stores the public key for future logins.'
  })
  @ApiResponse({ status: 200, description: 'Biometric registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid signature or expired challenge' })
  async register(@Req() req: any, @Body() dto: RegisterBiometricDto) {
    return this.biometricService.registerBiometric(req.user.sub, dto);
  }

  // ─── POST challenge for login (no auth needed) ───
  @Post('challenge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get challenge for biometric login',
    description: 'Phase 1 of Login: Generates a challenge for an unauthenticated user. The user must provide their userId (usually stored locally after first login).'
  })
  @ApiResponse({ status: 200, description: 'Challenge generated for login' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getChallengeForLogin(@Body() body: { userId: string }) {
    return this.biometricService.getChallengeForLogin(body.userId);
  }

  // ─── POST verify fingerprint → login ───
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Complete biometric login',
    description: 'Phase 2 of Login: Verifies the signature of the challenge using the previously registered public key. If valid, issues new JWT tokens.'
  })
  @ApiResponse({ status: 200, description: 'Login successful, returns access + refresh tokens', schema: { example: { accessToken: 'jwt', refreshToken: 'jwt', user: { id: '...', phone: '...' } } } })
  @ApiResponse({ status: 401, description: 'Verification failed - Invalid signature' })
  async verify(@Body() dto: VerifyBiometricDto) {
    return this.biometricService.verifyBiometric(dto);
  }

  // ─── GET list of registered devices ───
  @Get('devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "List user's registered fingerprint devices" })
  @ApiResponse({ status: 200, description: 'Device list returned' })
  async listDevices(@Req() req: any) {
    return this.biometricService.getDevices(req.user.sub);
  }

  // ─── DELETE deactivate a device ───
  @Delete('device/:deviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a registered fingerprint device' })
  @ApiResponse({ status: 200, description: 'Device deactivated' })
  async deactivateDevice(@Req() req: any, @Param('deviceId') deviceId: string) {
    return this.biometricService.deactivateDevice(req.user.sub, deviceId);
  }
}
