import { IsNumber, IsString } from 'class-validator'

export class ChaincatcherDto {
  @IsString()
  title: string

  @IsString()
  content: string

  @IsNumber()
  msgType: number

  @IsNumber()
  chaincatcherId: number
}
