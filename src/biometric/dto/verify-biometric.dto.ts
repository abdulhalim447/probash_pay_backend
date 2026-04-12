import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyBiometricDto {
  @ApiProperty({ example: 'user-uuid', description: 'The unique ID of the user trying to log in' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'uuid-challenge-id', description: 'The ID of the challenge received from the /biometric/challenge (POST) endpoint' })
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @ApiProperty({ description: 'Base64 encoded signature of the challenge string, created by the biometric private key stored on the device' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ example: 'device-unique-id-123', description: 'The unique identifier of the device being used for login' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
