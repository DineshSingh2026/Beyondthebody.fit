import { Controller, Get } from '@nestjs/common';
import { WellnessServicesService } from './wellness-services.service';

@Controller('services')
export class WellnessServicesController {
  constructor(private readonly wellnessServicesService: WellnessServicesService) {}

  @Get()
  findAll() {
    return this.wellnessServicesService.findAll();
  }
}
