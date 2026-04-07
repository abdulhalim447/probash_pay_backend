import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialLink } from './social-link.entity';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';

@Injectable()
export class SocialLinksService {
  constructor(
    @InjectRepository(SocialLink)
    private readonly socialLinkRepo: Repository<SocialLink>,
  ) {}

  async create(dto: CreateSocialLinkDto): Promise<SocialLink> {
    const link = this.socialLinkRepo.create(dto);
    return await this.socialLinkRepo.save(link);
  }

  async findAll(): Promise<SocialLink[]> {
    return await this.socialLinkRepo.find({
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<SocialLink[]> {
    return await this.socialLinkRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SocialLink> {
    const link = await this.socialLinkRepo.findOne({ where: { id } });
    if (!link) {
      throw new NotFoundException(`Social Link with id ${id} not found`);
    }
    return link;
  }

  async update(id: string, dto: UpdateSocialLinkDto): Promise<SocialLink> {
    const link = await this.findOne(id);
    Object.assign(link, dto);
    return await this.socialLinkRepo.save(link);
  }

  async remove(id: string): Promise<{ message: string }> {
    const link = await this.findOne(id);
    await this.socialLinkRepo.remove(link);
    return { message: 'Deleted successfully' };
  }

  async toggleActive(id: string): Promise<SocialLink> {
    const link = await this.findOne(id);
    link.isActive = !link.isActive;
    return await this.socialLinkRepo.save(link);
  }
}
