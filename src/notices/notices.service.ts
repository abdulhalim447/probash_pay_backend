import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from './notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepo: Repository<Notice>,
  ) {}

  async create(dto: CreateNoticeDto): Promise<Notice> {
    const notice = this.noticeRepo.create(dto);
    return await this.noticeRepo.save(notice);
  }

  async findAll(): Promise<Notice[]> {
    return await this.noticeRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Notice[]> {
    return await this.noticeRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notice> {
    const notice = await this.noticeRepo.findOne({ where: { id } });
    if (!notice) {
      throw new NotFoundException(`Notice with id ${id} not found`);
    }
    return notice;
  }

  async update(id: string, dto: UpdateNoticeDto): Promise<Notice> {
    const notice = await this.findOne(id);
    Object.assign(notice, dto);
    return await this.noticeRepo.save(notice);
  }

  async remove(id: string): Promise<{ message: string }> {
    const notice = await this.findOne(id);
    await this.noticeRepo.remove(notice);
    return { message: 'Notice deleted successfully' };
  }

  async toggleActive(id: string): Promise<Notice> {
    const notice = await this.findOne(id);
    notice.isActive = !notice.isActive;
    return await this.noticeRepo.save(notice);
  }
}
