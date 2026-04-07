import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './app-setting.entity';

// ─── Default Settings ─────────────────────────────────────
const DEFAULT_SETTINGS = [
  {
    key: 'exchange_rate_myr_to_bdt',
    value: '25.50',
    description: '1 MYR = ? BDT (Admin controlled exchange rate)',
  },
  {
    key: 'withdrawal_min_bdt',
    value: '500',
    description: 'Minimum withdrawal amount in BDT',
  },
  {
    key: 'withdrawal_max_bdt',
    value: '0',
    description: 'Maximum withdrawal amount in BDT (0 = no limit)',
  },
];

@Injectable()
export class AppSettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(AppSetting)
    private settingsRepo: Repository<AppSetting>,
  ) {}

  // ─── Seed defaults on first boot ───
  async onModuleInit() {
    for (const setting of DEFAULT_SETTINGS) {
      const exists = await this.settingsRepo.findOne({
        where: { key: setting.key },
      });
      if (!exists) {
        await this.settingsRepo.save(this.settingsRepo.create(setting));
      }
    }
  }

  // ─── Get all settings ───
  async getAllSettings(): Promise<AppSetting[]> {
    return await this.settingsRepo.find({ order: { id: 'ASC' } });
  }

  // ─── Get single setting by key ───
  async getSetting(key: string): Promise<string> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
    return setting.value;
  }

  // ─── Update setting ───
  async updateSetting(key: string, value: string): Promise<AppSetting> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
    setting.value = value;
    return await this.settingsRepo.save(setting);
  }

  // ─── Convenience: get exchange rate as number ───
  async getExchangeRate(): Promise<number> {
    const rate = await this.getSetting('exchange_rate_myr_to_bdt');
    return parseFloat(rate);
  }

  // ─── Convenience: get withdrawal limits ───
  async getWithdrawalLimits(): Promise<{ minBDT: number; maxBDT: number }> {
    const minBDT = parseFloat(await this.getSetting('withdrawal_min_bdt'));
    const maxBDT = parseFloat(await this.getSetting('withdrawal_max_bdt'));
    return { minBDT, maxBDT };
  }
}
