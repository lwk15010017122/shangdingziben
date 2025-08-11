import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import axios from 'axios'
import { Repository } from 'typeorm'
import { Chaincatcher } from '../chaincatcher/chaincatcher.entity'

@Injectable()
export class WeChatWebhookService {
  private readonly logger = new Logger(WeChatWebhookService.name)
  private readonly webhookUrl: string

  constructor(
    private configService: ConfigService,
        @InjectRepository(Chaincatcher)
        private readonly chaincatcherRepository: Repository<Chaincatcher>,
  ) {
    const key = this.configService.get<string>('WECHAT_BOT_KEY')
    if (!key) {
      throw new Error('WECHAT_WEBHOOK_KEY 环境变量未配置')
    }
    this.webhookUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}`
  }

  async sendText(content: string, id: number): Promise<void> {
    try {
      const data = {
        msgtype: 'markdown_v2',
        markdown_v2: {
          content,
        },
      }
      await axios.post(this.webhookUrl, data, {
        headers: { 'Content-Type': 'application/json' },
      }).then(async (response) => {
        // 这里能拿到请求成功的响应
        console.log('发送成功，响应:', response.data)
        await this.chaincatcherRepository.update(id, { msgType: 2 })
      })
      this.logger.log(`发送企业微信消息成功: ${content}`)
    }
    catch (error) {
      this.logger.error('发送企业微信消息失败', error)
    }
  }
}
