import { Module } from '@nestjs/common'
import { WechatWebhookModule } from '../wechat/wechat.module'
import { LiquidationService } from './liquidation.service'

@Module({
  imports: [WechatWebhookModule],
  providers: [LiquidationService],
})
export class LiquidationModule {}
