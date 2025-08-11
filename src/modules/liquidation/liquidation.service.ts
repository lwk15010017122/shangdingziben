import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import WebSocket from 'ws'
import { WeChatWebhookService } from '../wechat/wechat.service'

@Injectable()
export class LiquidationService implements OnModuleInit {
  private readonly logger = new Logger(LiquidationService.name)
  private ws: WebSocket
  private readonly thresholdUsd = 500_000 // 爆仓金额阈值

  // 你要监控的币种（统一小写）
  private readonly symbols = [
    'btcusdt',
    'ethusdt',
    'bnbusdt',
    'suiusdt',
    'aaveusdt',
  ]

  constructor(private readonly wechatWebhookService: WeChatWebhookService) {}

  onModuleInit() {
    this.connectWebSocket()
  }

  private connectWebSocket() {
    // 把多个币种的 forceOrder stream 合并到一个 WebSocket
    const streams = this.symbols.map(s => `${s}@forceOrder`).join('/')
    const url = `wss://fstream.binance.com/stream?streams=${streams}`

    this.ws = new WebSocket(url)

    this.ws.on('open', () => {
      this.logger.log(`Binance 爆仓多币种 WebSocket 已连接: ${this.symbols.join(', ')}`)
    })

    this.ws.on('message', async (data) => {
      try {
        const json = JSON.parse(data.toString())
        const msg = json.data // 合并流时数据在 data 里
        const order = msg.o
        const sym = order.s // 币种符号（如 BTCUSDT）
        const liquidationAmountUsd = Number.parseFloat(order.q) * Number.parseFloat(order.p)

        if (liquidationAmountUsd >= this.thresholdUsd) {
          const direction = order.S === 'BUY' ? '多' : '空'
          this.logger.warn(
            `大额爆仓！币种：${sym}，方向：${direction}，数量：${order.q}，价格：${order.p}，金额：${liquidationAmountUsd.toFixed(2)} USD`,
          )

          // 组装推送内容
          const str
            = `币安大额爆仓推送\n`
              + `| 币种 | 方向 | 数量 | 价格 | 金额 |\n`
              + `| :----- | :----: | :----: | :----: | -------: |\n`
              + `| ${sym} | ${direction} | ${order.q} | ${order.p} | ${liquidationAmountUsd.toFixed(2)} USDT |\n`

          await this.wechatWebhookService.sendText(str)
        }
      }
      catch (error) {
        this.logger.error('处理爆仓数据出错', error)
      }
    })

    this.ws.on('close', () => {
      this.logger.warn(`WebSocket 连接关闭，5秒后重连...`)
      setTimeout(() => this.connectWebSocket(), 5000)
    })

    this.ws.on('error', (err) => {
      this.logger.error('WebSocket 错误', err)
    })
  }
}
