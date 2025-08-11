import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Chaincatcher } from '../chaincatcher/chaincatcher.entity'
import { WeChatWebhookService } from './wechat.service'

@Module({
  imports: [TypeOrmModule.forFeature([Chaincatcher])],
  providers: [WeChatWebhookService],
  exports: [WeChatWebhookService],
})
export class WechatWebhookModule {}
