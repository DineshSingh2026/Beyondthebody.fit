import { Body, Controller, Post } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Controller('consultation')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  create(@Body() dto: CreateConsultationDto) {
    return this.consultationService.create(dto);
  }
}
