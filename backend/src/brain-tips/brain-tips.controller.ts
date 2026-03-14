import { Controller, Get } from '@nestjs/common';
import { BrainTipsService } from './brain-tips.service';

@Controller('brain-tips')
export class BrainTipsController {
  constructor(private readonly brainTipsService: BrainTipsService) {}

  @Get()
  findAll() {
    return this.brainTipsService.findAll();
  }
}
