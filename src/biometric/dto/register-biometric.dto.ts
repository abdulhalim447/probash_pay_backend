import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterBiometricDto {
  @ApiProperty({ example: 'uuid-challenge-id', description: 'The ID of the challenge received from the /challenge endpoint' })
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @ApiProperty({ 
    description: 'RSA Public Key in PEM format generated on the mobile device',
    example: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFA... (truncated)\n-----END PUBLIC KEY-----'
  })
  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @ApiProperty({ description: 'Base64 encoded signature of the challenge string, created using the private key on the device' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ example: 'device-unique-id-123', description: 'A unique identifier for the device (e.g., Android ID or iOS Vendor ID)' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiPropertyOptional({ example: "Rafi's Galaxy S24", description: 'A human-readable name for the device to help the user manage their devices' })
  @IsString()
  @IsOptional()
  deviceName?: string;
}
