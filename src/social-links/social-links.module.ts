import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialLink } from './social-link.entity';
import { SocialLinksService } from './social-links.service';
import { SocialLinksController } from './social-links.controller';
import { AdminSocialLinksController } from './admin-social-links.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SocialLink])],
  controllers: [SocialLinksController, AdminSocialLinksController],
  providers: [SocialLinksService],
  exports: [SocialLinksService],
})
export class SocialLinksModule {}
