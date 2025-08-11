import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import axios from 'axios'
import { Repository } from 'typeorm'
import { Chaincatcher } from '../chaincatcher/chaincatcher.entity'

@Injectable()
export class WeChatWebhookService {
  private readonly logger = new Logger(WeChatWebhookService.name)
  private readonly key: string
  private readonly szKey: string

  constructor(
    private configService: ConfigService,
    @InjectRepository(Chaincatcher)
    private readonly chaincatcherRepository: Repository<Chaincatcher>,
  ) {
    this.key = this.configService.get<string>('WECHAT_BOT_KEY')
    this.szKey = this.configService.get<string>('WECHAT_BOT_SZ_KEY')
  }

  async sendText(content: string, id?: number): Promise<void> {
    try {
      const data = {
        msgtype: 'markdown_v2',
        markdown_v2: {
          content,
        },
      }
      const webhookKey = id ? this.key : this.szKey

      const response = await axios.post(
        `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${webhookKey}`,
        data,
        { headers: { 'Content-Type': 'application/json' } },
      )

      this.logger.log(`发送企业微信消息成功: ${content}, 响应: ${JSON.stringify(response.data)}`)

      if (id) {
        await this.chaincatcherRepository.update(id, { msgType: 2 })
      }
    }
    catch (error) {
      this.logger.error('发送企业微信消息失败', error)
    }
  }
}
