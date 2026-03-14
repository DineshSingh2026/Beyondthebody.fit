import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateContactDto) {
    if (this.db.connected) {
      try {
        await this.db.query(
          'INSERT INTO join_applications (name, email, service, message) VALUES ($1, $2, $3, $4)',
          [dto.name.trim(), dto.email.trim(), (dto.service || '').trim(), dto.message.trim()],
        );
      } catch {
        throw new InternalServerErrorException('Could not save. Please try again.');
      }
    } else {
      console.log('New join application:', dto);
    }
    return { success: true, message: "Thank you! We'll be in touch within 24 hours." };
  }
}
