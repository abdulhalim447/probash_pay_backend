import { Controller, Get } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notices')
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  @ApiOperation({ summary: 'অ্যাপের সকল সচল (Active) নোটিশ দেখা' })
  @ApiResponse({ status: 200, description: 'লিস্ট সফলভাবে পাওয়া গেছে' })
  async getActiveNotices() {
    return await this.noticesService.findActive();
  }
}
