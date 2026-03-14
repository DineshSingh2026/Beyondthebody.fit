import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AffirmationsModule } from './affirmations/affirmations.module';
import { BrainTipsModule } from './brain-tips/brain-tips.module';
import { ConditionsModule } from './conditions/conditions.module';
import { ContactModule } from './contact/contact.module';
import { ConsultationModule } from './consultation/consultation.module';
import { QuotesModule } from './quotes/quotes.module';
import { WellnessServicesModule } from './wellness-services/wellness-services.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AffirmationsModule,
    BrainTipsModule,
    ConditionsModule,
    ContactModule,
    ConsultationModule,
    QuotesModule,
    WellnessServicesModule,
    HealthModule,
  ],
})
export class AppModule {}
