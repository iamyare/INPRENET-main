import { IsString, IsEmail, Length } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(1, 100)
  question1Answer: string;

  @IsString()
  @Length(1, 100)
  question2Answer: string;

  @IsString()
  @Length(1, 100)
  question3Answer: string; 
}