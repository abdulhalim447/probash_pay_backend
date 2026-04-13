import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppVersionsService } from './app-versions.service';
import { AppVersion } from './app-version.entity';

@ApiTags('App Versions')
@Controller('app-versions')
export class AppVersionsController {
  constructor(private readonly appVersionsService: AppVersionsService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get the latest active app version' })
  @ApiResponse({ status: 200, description: 'Return the latest app version.', type: AppVersion })
  findLatest() {
    return this.appVersionsService.findLatest();
  }
}
