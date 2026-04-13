import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppVersion } from './app-version.entity';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';

@Injectable()
export class AppVersionsService {
  constructor(
    @InjectRepository(AppVersion)
    private readonly appVersionRepository: Repository<AppVersion>,
  ) {}

  async create(createAppVersionDto: CreateAppVersionDto): Promise<AppVersion> {
    if (createAppVersionDto.isActive !== false) {
      // If setting as active, deactivate all others
      await this.appVersionRepository.update({ isActive: true }, { isActive: false });
    }
    const appVersion = this.appVersionRepository.create(createAppVersionDto);
    return this.appVersionRepository.save(appVersion);
  }

  async findAll(): Promise<AppVersion[]> {
    return this.appVersionRepository.find({ order: { versionCode: 'DESC' } });
  }

  async findLatest(): Promise<AppVersion> {
    const latest = await this.appVersionRepository.findOne({
      where: { isActive: true },
      order: { versionCode: 'DESC' },
    });
    if (!latest) {
      throw new NotFoundException('No active app version found');
    }
    return latest;
  }

  async update(id: number, updateAppVersionDto: UpdateAppVersionDto): Promise<AppVersion> {
    if (updateAppVersionDto.isActive === true) {
      await this.appVersionRepository.update({ isActive: true }, { isActive: false });
    }
    await this.appVersionRepository.update(id, updateAppVersionDto);
    return this.findOne(id);
  }

  async findOne(id: number): Promise<AppVersion> {
    const appVersion = await this.appVersionRepository.findOne({ where: { id } });
    if (!appVersion) {
      throw new NotFoundException(`App version with ID ${id} not found`);
    }
    return appVersion;
  }

  async remove(id: number): Promise<void> {
    await this.appVersionRepository.delete(id);
  }
}
