import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WechatWebhookModule } from '../wechat/wechat.module'
import { Chaincatcher } from './chaincatcher.entity'
import { ChaincatcherService } from './chaincatcher.service'

@Module({
  imports: [TypeOrmModule.forFeature([Chaincatcher]), WechatWebhookModule],
  providers: [ChaincatcherService],
  exports: [ChaincatcherService],
})
export class ChaincatcherModule {}
