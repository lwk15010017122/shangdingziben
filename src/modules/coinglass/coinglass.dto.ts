import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateCoinglassDto {
  @IsString()
  transaction_hash: string // 交易哈希

  @IsString()
  asset_symbol: string // 资产符号

  @IsNumber()
  amount_usd: number // 美元金额

  @IsNumber()
  asset_quantity: number // 数量

  @IsString()
  exchange_name: string // 交易所名称

  @IsInt()
  transfer_type: number // 转账类型：1: 转入, 2: 转出, 3: 内部转账

  @IsString()
  from_address: string // 转出地址

  @IsString()
  to_address: string // 转入地址

  @IsNumber()
  transaction_time: number // 时间戳（秒）

  @IsOptional()
  @IsInt()
  msgType: number // 值为2表示已经推送过了
}
