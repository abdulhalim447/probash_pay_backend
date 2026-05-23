import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateNoticeDto {
  @ApiProperty({ example: 'ঈদ মোবারক!', description: 'নোটিশের শিরোনাম' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'সকল গ্রাহকদের জানাই পবিত্র ঈদুল ফিতরের শুভেচ্ছা।', description: 'নোটিশের বিস্তারিত বর্ণনা' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'ইমেইজের URL (অপশনাল)', required: false })
  @IsOptional()
  @IsString()
  imageUrl: string;
}
