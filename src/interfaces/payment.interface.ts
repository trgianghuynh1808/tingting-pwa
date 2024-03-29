import { IBaseEntity } from './base.interface'
import { EInputMode, EPaymentCategory } from '@/enums'

export interface IPayment extends IBaseEntity {
  price: number
  mode: EInputMode
  category: EPaymentCategory
  payment_at: Date
  synced: boolean
  synced_at?: Date
  archived?: boolean
  archived_at?: Date
  indentity_id?: string
}
