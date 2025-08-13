import { Module } from '@nestjs/common'
import { AekhamService } from './aekham.service'

@Module({
  providers: [AekhamService],
})
export class AekhamModule {}
