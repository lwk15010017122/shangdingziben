import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { Repository } from 'typeorm'
import { WeChatWebhookService } from '../wechat/wechat.service'
import { ChaincatcherDto } from './chaincatcher.dto'

import { Chaincatcher } from './chaincatcher.entity'

@Injectable()
export class ChaincatcherService {
  private readonly logger = new Logger(ChaincatcherService.name)
  constructor(
        @InjectRepository(Chaincatcher)
        private readonly ChaincatcherRepository: Repository<Chaincatcher>,
        private configService: ConfigService,
        private readonly wechatWebhookService: WeChatWebhookService,
  ) { }

  async createChaincatcher(dto: ChaincatcherDto): Promise<Chaincatcher> {
    const exists = await this.ChaincatcherRepository.findOne({
      where: { chaincatcherId: dto.chaincatcherId },
    })

    if (exists) {
      return exists // 已有数据，直接返回
    }

    const chaincatcher = this.ChaincatcherRepository.create(dto)
    return await this.ChaincatcherRepository.save(chaincatcher)
  }

  // 每两分钟执行一次
  @Cron('*/3 * * * *')
  async fetchAndSave() {
    this.logger.log('定时任务开始')
    try {
      const res = await axios.get(this.configService.get<string>('CHAINCATCHER_URL'))
      const $ = cheerio.load(res.data)

      const listContents = $('.list_content .items').toArray()

      for (const el of listContents) {
        const title = $(el).find('span.article_title_span').text()
        let chaincatcherId = $(el).find('.article_area .article_left a').attr('href')
        chaincatcherId = chaincatcherId.split('/')[2]
        let content = $(el).find('div.article_content').text()
        content = content.replace(/ChainCatcher 消息/g, '').trim()

        try {
          await this.createChaincatcher({
            title,
            content,
            msgType: 1,
            chaincatcherId: Number(chaincatcherId),
          })
        }
        catch (err) {
          this.logger.error(`保存数据失败，标题：${title}`, err.stack)
        }
      }
    }
    catch (error) {
      this.logger.error('抓取失败', error.stack)
    }
  }

  @Cron('*/3 * * * *')
  async chaincatcherMsg() {
    try {
      const list = await this.ChaincatcherRepository.find({
        where: { msgType: 1 },
      })
      for (const item of list) {
        const query = `${item.title}\n---\n` + `\`\`\`\n${item.content}\n`
        await this.wechatWebhookService.sendText(query, item.id)
      }
    }
    catch (error) {
      this.logger.error('chaincatcherMsg-推送失败', error.stack)
    }
  }

  @Cron('0 0 */2 * *')
  async delChaincatcherMsg() {
    try {
      await this.ChaincatcherRepository.createQueryBuilder()
        .delete()
        .from(Chaincatcher)
        .where('msgType = :msgType', { msgType: 2 })
        .andWhere('createdAt < NOW() - INTERVAL 1 DAY')
        .execute()
    }
    catch (error) {
      this.logger.error('delChaincatcherMsg-失败', error.stack)
    }
  }
}
