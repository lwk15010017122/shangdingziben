import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('chaincatcher')
export class Chaincatcher {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text' })
  title: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'int' })
  chaincatcherId: number

  @Column({ type: 'int' }) // 值为2时表示已经推送过了
  msgType: number

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
