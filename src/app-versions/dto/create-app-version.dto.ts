import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateAppVersionDto {
  @ApiProperty({ example: '2.0.1', description: 'The version name of the app' })
  @IsString()
  @IsNotEmpty()
  versionName: string;

  @ApiProperty({ example: 201, description: 'The version code of the app (integer)' })
  @IsNumber()
  @IsNotEmpty()
  versionCode: number;

  @ApiProperty({ example: 'https://example.com/app.apk', description: 'The direct download URL for the APK' })
  @IsUrl()
  @IsNotEmpty()
  apkUrl: string;

  @ApiProperty({ example: 'Bug fixes and performance improvements', description: 'Release notes' })
  @IsString()
  @IsOptional()
  releaseNotes?: string;

  @ApiProperty({ example: false, description: 'Whether to force the update' })
  @IsBoolean()
  @IsOptional()
  isForceUpdate?: boolean;

  @ApiProperty({ example: true, description: 'Whether this version is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
