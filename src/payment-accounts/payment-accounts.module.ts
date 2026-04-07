import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentAccount } from './payment-account.entity';
import { PaymentAccountsService } from './payment-accounts.service';
import { PaymentAccountsController } from './payment-accounts.controller';
import { AdminPaymentAccountsController } from './admin-payment-accounts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentAccount])],
  controllers: [PaymentAccountsController, AdminPaymentAccountsController],
  providers: [PaymentAccountsService],
  exports: [PaymentAccountsService],
})
export class PaymentAccountsModule {}
