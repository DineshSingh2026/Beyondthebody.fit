import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConsultationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  concern?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
