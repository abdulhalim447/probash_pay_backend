import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './notice.entity';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';
import { AdminNoticesController } from './admin-notices.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notice])],
  controllers: [NoticesController, AdminNoticesController],
  providers: [NoticesService],
  exports: [NoticesService],
})
export class NoticesModule {}
