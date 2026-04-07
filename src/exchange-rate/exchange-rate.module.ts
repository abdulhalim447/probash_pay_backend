import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRateHistory } from './exchange-rate.entity';
import { ExchangeRateService } from './exchange-rate.service';
import { AppSettingsModule } from '../app-settings/app-settings.module';

import { ExchangeRateController } from './exchange-rate.controller';
import { AdminExchangeRateController } from './admin-exchange-rate.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeRateHistory]),
    AppSettingsModule,
  ],
  controllers: [ExchangeRateController, AdminExchangeRateController],
  providers: [ExchangeRateService],
  exports: [ExchangeRateService],
})
export class ExchangeRateModule {}
