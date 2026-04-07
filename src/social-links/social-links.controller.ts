import { Controller, Get } from '@nestjs/common';
import { SocialLinksService } from './social-links.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Social Links')
@Controller('social-links')
export class SocialLinksController {
  constructor(private readonly socialLinksService: SocialLinksService) {}

  @Get()
  @ApiOperation({ summary: 'অ্যাপের সোশ্যাল মিডিয়া লিঙ্কগুলো দেখা (Facebook, WhatsApp, etc.)' })
  @ApiResponse({ status: 200, description: 'লিস্ট সফলভাবে পাওয়া গেছে' })
  async getActiveLinks() {
    return await this.socialLinksService.findActive();
  }
}
