import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import axios from 'axios'
import * as dayjs from 'dayjs'
import { Repository } from 'typeorm'
import { WeChatWebhookService } from '../wechat/wechat.service'
import { Coinglass } from './coinglass.entity'

@Injectable()
export class CoinglassService {
  private readonly logger = new Logger(CoinglassService.name)

  constructor(
    private configService: ConfigService,
        @InjectRepository(Coinglass)
        private readonly coinglassRepo: Repository<Coinglass>,
        private readonly wechatWebhookService: WeChatWebhookService,
  ) { }

  @Cron('*/1 * * * *') // 每分钟执行一次
  async getChainTxList() {
    const url = 'https://open-api-v4.coinglass.com/api/exchange/chain/tx/list'
    const headers = {
      'accept': 'application/json',
      'CG-API-KEY': this.configService.get<string>('COINGLASS_KEY'),
    }

    try {
      const response = await axios.get(url, { headers })
      if (response.data?.data?.length) {
        // 筛选大额交易
        const bigTx = response.data.data.filter(
          item => item.amount_usd > 500_000 && item.transfer_type !== 3,
        )

        for (const tx of bigTx) {
          // 避免重复插入
          const exist = await this.coinglassRepo.findOneBy({
            transaction_hash: tx.transaction_hash,
          })
          if (!exist) {
            const entity = this.coinglassRepo.create({
              transaction_hash: tx.transaction_hash,
              asset_symbol: tx.asset_symbol,
              amount_usd: tx.amount_usd,
              asset_quantity: tx.asset_quantity,
              exchange_name: tx.exchange_name,
              transfer_type: tx.transfer_type,
              from_address: tx.from_address,
              to_address: tx.to_address,
              transaction_time: tx.transaction_time,
              msgType: 1, // 默认未推送
            })
            await this.coinglassRepo.save(entity)
            this.logger.log(`已保存大额交易: ${tx.transaction_hash}`)
          }
        }
      }
    }
    catch (error) {
      this.logger.error('获取 getChainTxList 数据失败', error)
      throw error
    }
  }

  @Cron('*/1 * * * *') // 每分钟执行一次
  async chainTxMsg() {
    try {
      // 查询所有 msgType 为 1 的交易
      const list = await this.coinglassRepo.find({
        where: { msgType: 1 },
      })

      for (const item of list) {
        const query = `${item.exchange_name}-ERC-20大额转账<font color=\"${item.transfer_type === 1 ? 'info' : 'warning'}\">${item.transfer_type === 1 ? '转入' : '转出'}</font>，老师们请注意。\n>资产符号:<font color=\"comment\">${item.asset_symbol}</font>\n>金额:<font color=\"comment\">${item.amount_usd}USDT</font>\n>数量:<font color=\"comment\">${item.asset_quantity}</font>\n>交易时间:<font color=\"comment\">${dayjs.unix(item.transaction_time).format('YYYY-MM-DD HH:mm:ss')}</font>\n>交易哈希:<font color=\"comment\">${item.transaction_hash}</font>\n>转出地址:<font color=\"comment\">${item.from_address}</font>\n>转入地址:<font color=\"comment\">${item.to_address}</font>`
        await this.wechatWebhookService.sendText(query, null, 'markdown')

        // 更新 msgType 为 2
        await this.coinglassRepo.update(item.id, { msgType: 2 })
      }
    }
    catch (error) {
      this.logger.error('chainTxMsg 失败', error)
      throw error
    }
  }

  @Cron('0 0 */2 * *')
  async delChainTxMsg() {
    try {
      await this.coinglassRepo.createQueryBuilder()
        .delete()
        .from(Coinglass)
        .where('msgType = :msgType', { msgType: 2 })
        .andWhere('createdAt < NOW() - INTERVAL 1 DAY')
        .execute()
    }
    catch (error) {
      this.logger.error('delChainTxMsg-失败', error.stack)
    }
  }
}
