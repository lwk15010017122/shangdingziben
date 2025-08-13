import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'coinglass_transactions' })
export class Coinglass {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100, unique: true })
  transaction_hash: string // 交易哈希

  @Column({ type: 'varchar', length: 20 })
  asset_symbol: string // 资产符号

  @Column({ type: 'decimal', precision: 30, scale: 8 })
  amount_usd: number // 美元金额

  @Column({ type: 'decimal', precision: 40, scale: 8 })
  asset_quantity: number // 数量

  @Column({ type: 'varchar', length: 50 })
  exchange_name: string // 交易所名称

  @Column({ type: 'int' })
  transfer_type: number // 转账类型：1: 转入, 2: 转出, 3: 内部转账

  @Column({ type: 'varchar', length: 100 })
  from_address: string // 转出地址

  @Column({ type: 'varchar', length: 100 })
  to_address: string // 转入地址

  @Column({ type: 'bigint' })
  transaction_time: number // 时间戳（秒）

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @Column({ type: 'int' }) // 值为2时表示已经推送过了
  msgType: number
}
