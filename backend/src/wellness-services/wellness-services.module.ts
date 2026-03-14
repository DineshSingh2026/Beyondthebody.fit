import { Module } from '@nestjs/common';
import { WellnessServicesController } from './wellness-services.controller';
import { WellnessServicesService } from './wellness-services.service';

@Module({
  controllers: [WellnessServicesController],
  providers: [WellnessServicesService],
})
export class WellnessServicesModule {}
