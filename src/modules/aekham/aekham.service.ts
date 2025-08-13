import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AekhamService {
  private readonly logger = new Logger(AekhamService.name)
  constructor(
    private configService: ConfigService,
  ) { }
  // 获取中心交易所
  // @Cron('*/1 * * * *')
  // async getCEX() {
  //     try {
  //         const res = await axios.get('https://intel.arkm.com/')
  //         const $ = cheerio.load(res.data)
  //         console.log($.html(),'====> $ ')
  //     } catch (error) {
  //         this.logger.error('getCEX-失败', error.stack);
  //         throw error;
  //     }
  // }
}
