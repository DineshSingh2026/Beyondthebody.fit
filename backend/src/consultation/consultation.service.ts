import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateConsultationDto) {
    if (this.db.connected) {
      try {
        await this.db.query(
          'INSERT INTO consultations (name, email, phone, concern, message) VALUES ($1, $2, $3, $4, $5)',
          [
            dto.name.trim(),
            dto.email.trim(),
            (dto.phone || '').trim(),
            (dto.concern || '').trim(),
            (dto.message || '').trim(),
          ],
        );
      } catch {
        throw new InternalServerErrorException('Could not save. Please try again.');
      }
    } else {
      console.log('Free consultation request:', dto);
    }
    return {
      success: true,
      message:
        "Your free 15-minute consultation has been requested! We'll contact you within 24 hours.",
    };
  }
}
