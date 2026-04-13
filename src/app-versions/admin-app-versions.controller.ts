import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppVersionsService } from './app-versions.service';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AppVersion } from './app-version.entity';

@ApiTags('Admin / App Versions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/app-versions')
export class AdminAppVersionsController {
  constructor(private readonly appVersionsService: AppVersionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new app version' })
  @ApiResponse({ status: 201, description: 'The app version has been successfully created.', type: AppVersion })
  create(@Body() createAppVersionDto: CreateAppVersionDto) {
    return this.appVersionsService.create(createAppVersionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all app versions' })
  @ApiResponse({ status: 200, description: 'Return all app versions.', type: [AppVersion] })
  findAll() {
    return this.appVersionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an app version by ID' })
  @ApiResponse({ status: 200, description: 'Return the app version.', type: AppVersion })
  findOne(@Param('id') id: string) {
    return this.appVersionsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an app version' })
  @ApiResponse({ status: 200, description: 'The app version has been successfully updated.', type: AppVersion })
  update(@Param('id') id: string, @Body() updateAppVersionDto: UpdateAppVersionDto) {
    return this.appVersionsService.update(+id, updateAppVersionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an app version' })
  @ApiResponse({ status: 200, description: 'The app version has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.appVersionsService.remove(+id);
  }
}
