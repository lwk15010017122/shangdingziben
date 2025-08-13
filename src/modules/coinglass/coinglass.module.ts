// coinglass.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WechatWebhookModule } from '../wechat/wechat.module'
import { Coinglass } from './coinglass.entity'
import { CoinglassService } from './coinglass.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Coinglass]),
    WechatWebhookModule,
  ],
  providers: [CoinglassService],
  exports: [CoinglassService],
})
export class CoinglassModule {}
