import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRateHistory } from './exchange-rate.entity';
import { AppSettingsService } from '../app-settings/app-settings.service';

@Injectable()
export class ExchangeRateService {
  constructor(
    @InjectRepository(ExchangeRateHistory)
    private exchangeRateHistoryRepo: Repository<ExchangeRateHistory>,
    private appSettingsService: AppSettingsService,
  ) {}

  async getCurrentRate(): Promise<number> {
    const rate = await this.appSettingsService.getExchangeRate();
    return rate;
  }

  async setRate(
    adminId: number,
    newRate: number,
  ): Promise<ExchangeRateHistory> {
    if (newRate <= 0) {
      throw new BadRequestException('Exchange rate must be greater than 0');
    }

    const previousRate = await this.getCurrentRate();

    const historyRecord = this.exchangeRateHistoryRepo.create({
      rate: newRate,
      previousRate: previousRate,
      changedByAdminId: adminId,
    });

    const savedRecord = await this.exchangeRateHistoryRepo.save(historyRecord);

    await this.appSettingsService.updateSetting(
      'exchange_rate_myr_to_bdt',
      newRate.toString(),
    );

    return savedRecord;
  }

  async getHistory(): Promise<any[]> {
    const records = await this.exchangeRateHistoryRepo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return records.map((record) => {
      let changePercent = '0.00';
      if (record.previousRate && Number(record.previousRate) > 0) {
        const change =
          ((Number(record.rate) - Number(record.previousRate)) /
            Number(record.previousRate)) *
          100;
        const formattedChange = change.toFixed(2);
        changePercent = change >= 0 ? `+${formattedChange}` : formattedChange;
      }
      return {
        ...record,
        changePercent,
      };
    });
  }
}
