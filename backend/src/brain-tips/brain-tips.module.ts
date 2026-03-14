import { Module } from '@nestjs/common';
import { BrainTipsController } from './brain-tips.controller';
import { BrainTipsService } from './brain-tips.service';

@Module({
  controllers: [BrainTipsController],
  providers: [BrainTipsService],
})
export class BrainTipsModule {}
