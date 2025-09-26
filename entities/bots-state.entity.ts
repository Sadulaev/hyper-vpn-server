import {
  Entity, PrimaryGeneratedColumn, Column, Index, UpdateDateColumn,
} from 'typeorm';

@Entity('bot_state')
@Index(['name'], { unique: true })
export class BotState {
  @PrimaryGeneratedColumn()
  id: number;

  // имя бота, например "botB"
  @Column({ type: 'varchar', length: 64, unique: true })
  name: string;

  // ручной флаг
  @Column({ type: 'boolean', default: true })
  enabled: boolean;
}