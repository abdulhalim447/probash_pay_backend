import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // CORS Enable
  app.enableCors();

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Probash Pay - Advanced Remittance API')
    .setDescription(
      'মালয়েশিয়া থেকে বাংলাদেশে টাকা পাঠানোর জন্য একটি অত্যাধুনিক এবং নিরাপদ রেমিট্যান্স প্ল্যাটফর্ম। এই ডকুমেন্টেশনটি ডেভেলপারদের জন্য এপিআই ইন্টিগ্রেশন সহজ করার উদ্দেশ্যে তৈরি করা হয়েছে।',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'লগইন করার পর পাওয়া Access Token এখানে দিন (Bearer <token>)',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'ব্যবহারকারী রেজিস্ট্রেশন এবং লগইন')
    .addTag('Profile', 'ইউজার প্রোফাইল ও সিকিউরিটি')
    .addTag('Wallet', 'ওয়ালেটে ব্যালেন্স চেক এবং লেনদেন')
    .addTag('Deposits', 'ডিপোজিট রিকোয়েস্ট সাবমিশন')
    .addTag('Withdrawals', 'উইথড্রয়াল বা ক্যাশ-আউট রিকোয়েস্ট')
    .addTag('Transactions', 'লেনদেনের বিস্তারিত ইতিহাস')
    .addTag('Tickets', 'সাপোর্ট টিকিট এবং কমপ্লেইন ম্যানেজমেন্ট')
    .addTag('Exchange Rate', 'বর্তমান কারেন্সি কনভার্সন রেট')
    .addTag('Notices', 'অ্যাপের নোটিশ এবং অ্যাপ-সিস্টেম এনাউন্সমেন্ট')
    .addTag('Social Links', 'অফিসিয়াল যোগাযোগ করার সোশ্যাল লিঙ্কসমূহ')
    .addTag('Notifications', 'পুশ নোটিফিকেশন রিসিভ করার সেটিংস')
    .addTag('Admin / Users', 'এডমিন: ইউজার ডাটাবেস ও স্ট্যাটাস কন্ট্রোল')
    .addTag('Admin / Deposits', 'এডমিন: ডিপোজিট ভেরিফিকেশন ও অ্যাপ্রুভাল')
    .addTag('Admin / Withdrawals', 'এডমিন: টাকা পাঠানোর রিকোয়েস্ট প্রোসেস করা')
    .addTag('Admin / Tickets', 'এডমিন: কাস্টমার কমপ্লেইন এর রিপ্লাই দেওয়া')
    .addTag('Admin / Dashboard', 'এডমিন: বিজনেস এনালিটিক্স ও রিপোর্ট')
    .addTag('Admin / Exchange Rate', 'এডমিন: কারেন্সি রেট আপডেট করা')
    .addTag('Admin / Payment Accounts', 'এডমিন: পেমেন্ট গেটওয়ে বা ব্যাংক তথ্য সেট করা')
    .addTag('Admin / Notices', 'এডমিন: অ্যাপের নোটিশ ম্যানেজমেন্ট')
    .addTag('Admin / Social Links', 'এডমিন: সোশ্যাল লিঙ্ক আপডেট করা')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Scalar UI - Premium API Reference
  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'purple',
      showSidebar: true,
      hideDownloadButton: true,
      metaData: {
        title: 'Probash Pay API Reference',
        description: 'Complete integrated API guide for Probash Pay remittance platform.',
      },
    }),
  );

  // Raw swagger (optional)
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}`);
  console.log(`📚 Premium API Reference: http://localhost:${port}/docs`);
}
bootstrap();
