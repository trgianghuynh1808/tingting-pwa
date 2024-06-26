import dayjs from 'dayjs'
import { useContext, useEffect, useMemo, useState } from 'react'
import DatePicker, { DateValueType } from 'react-tailwindcss-datepicker'
import { v4 as uuidv4 } from 'uuid'

// *INFO: internal modules
import { AppContext } from '@/contexts'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  addPayment,
  archivePayments,
  editPayment,
  getPaymentsInLastMonth,
  getPaymentsInMonth,
  removePayment,
} from '@/store/features/payments/paymentThunk'
import PaymentModal from './PaymentModal'
import CategoryLightBox from './CategoryLightBox'
import { CATEGORY_OPTIONS, EPaymentFormMode } from './constants'
import { PaymentFormContext } from './paymentForm.context'
import { EInputMode } from '@/enums'
import { getValidArray } from '@/utils'
import { IPayment, TAddPayload } from '@/interfaces'
import ArchiveNotifyModal from './ArchiveNotifyModal'

export default function PaymentForm() {
  const dispatch = useAppDispatch()
  const { inputMode } = useContext(AppContext)
  const {
    pickDate,
    price,
    paymentCategoryOption,
    setPaymentCategoryOption,
    setPrice,
    setPickDate,
    formMode,
    setFormMode,
    showPaymentModal,
    setShowPaymentModal,
    selectedKey,
  } = useContext(PaymentFormContext)
  const { paymentsInMonth, paymentsInLastMonth } = useAppSelector(
    (state) => state.payments,
  )

  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [showArchiveNotifyModal, setShowArchiveNotifyModal] =
    useState<boolean>(false)
  const [archiveSucceed, setArchiveSucceed] = useState<boolean>(false)

  console.log(paymentsInLastMonth)

  const isValidDate = useMemo(() => {
    return Boolean(pickDate?.startDate) && Boolean(pickDate?.endDate)
  }, [pickDate])
  const existsPaymentsInLastMonth = useMemo(() => {
    return paymentsInLastMonth?.length > 0
  }, [paymentsInLastMonth])

  function onClickAddBtn(): void {
    setFormMode(EPaymentFormMode.ADD)
    setShowPaymentModal(true)
  }

  async function onClickArchiveBtn(): Promise<void> {
    if (!window?.navigator?.onLine) {
      setArchiveSucceed(false)
    } else {
      await dispatch(archivePayments())
      await dispatch(getPaymentsInLastMonth())
      await dispatch(getPaymentsInMonth())

      setArchiveSucceed(true)
    }

    setShowArchiveNotifyModal(true)
  }

  function getExistsPayment(): IPayment | undefined {
    return getValidArray(paymentsInMonth).find((item) => {
      if (formMode === EPaymentFormMode.ADD) {
        const isCategory = item.category === paymentCategoryOption.value
        const isInputMode = item.mode === inputMode
        const isDate = dayjs(pickDate?.startDate).isSame(
          dayjs(item.payment_at),
          'day',
        )

        return isCategory && isInputMode && isDate
      }

      return item.id === selectedKey
    })
  }

  async function handleAddPayment(existsPayment?: IPayment): Promise<void> {
    const priceNumber = parseInt(price)
    const uuid = uuidv4()

    const payload: TAddPayload<IPayment> = {
      mode: inputMode,
      category: paymentCategoryOption.value,
      synced: false,
      payment_at: dayjs(pickDate?.startDate).toDate(),
      updated_at: new Date(),
      price: !existsPayment ? priceNumber : existsPayment.price + priceNumber,
    }

    if (existsPayment) {
      await dispatch(editPayment({ key: existsPayment.id, payload }))
      return
    }

    await dispatch(
      addPayment({
        ...payload,
        indentity_id: uuid,
      }),
    )
  }

  async function handleUpdatePayment(existsPayment: IPayment): Promise<void> {
    const priceNumber = parseInt(price)

    const payload: TAddPayload<IPayment> = {
      mode: existsPayment.mode,
      category: existsPayment.category,
      synced: false,
      payment_at: existsPayment.payment_at,
      updated_at: new Date(),
      price: priceNumber,
    }

    if (priceNumber) {
      await dispatch(editPayment({ key: existsPayment.id, payload }))
      return
    }

    await dispatch(removePayment({ key: existsPayment.id }))
  }

  async function handleSubmitForm(): Promise<void> {
    const existsPayment = getExistsPayment()

    switch (formMode) {
      case EPaymentFormMode.ADD:
        await handleAddPayment(existsPayment)
        break
      default:
        await handleUpdatePayment(existsPayment!)
        break
    }
    setPrice('')
  }

  function onChangePicker(newValue: DateValueType): void {
    setPickDate(newValue)
  }

  useEffect(() => {
    if (isMounted) {
      setFormMode(EPaymentFormMode.ADD)
      setShowPaymentModal(true)
    }
  }, [paymentCategoryOption])

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
    }
  }, [isMounted])

  return (
    <div className="grid grid-cols-4 gap-4 ">
      <PaymentModal
        isOpen={showPaymentModal}
        setIsOpen={setShowPaymentModal}
        handleOnSubmit={handleSubmitForm}
      />
      <ArchiveNotifyModal
        isOpen={showArchiveNotifyModal}
        setIsOpen={setShowArchiveNotifyModal}
        succeed={archiveSucceed}
      />

      <div className="col-span-4">
        <DatePicker
          primaryColor="purple"
          containerClassName="relative w-full cursor-default rounded-lg shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
          useRange={false}
          asSingle={true}
          readOnly={true}
          displayFormat={'DD/MM/YYYY'}
          minDate={dayjs().startOf('month').toDate()}
          maxDate={dayjs().toDate()}
          value={pickDate}
          onChange={onChangePicker}
        />
      </div>

      <div className="col-span-2">
        <CategoryLightBox
          options={CATEGORY_OPTIONS}
          selectedOption={paymentCategoryOption}
          setSelectedOption={setPaymentCategoryOption}
        />
      </div>
      <div className="col-span-2">
        {existsPaymentsInLastMonth ? (
          <button
            className="inline-flex items-center justify-center w-full h-10 text-base font-medium text-center text-white rounded-lg shadow-sm cursor-pointer hover:text-white bg-blue-400 isabled:opacity-30"
            onClick={onClickArchiveBtn}
          >
            <span className="relative">Archive</span>
          </button>
        ) : (
          <button
            className="inline-flex items-center justify-center w-full h-10 text-base font-medium text-center text-white rounded-lg shadow-sm cursor-pointer hover:text-white bg-blue-400 isabled:opacity-30"
            disabled={!isValidDate || inputMode === EInputMode.ALL}
            onClick={onClickAddBtn}
          >
            <span className="relative">Thêm</span>
          </button>
        )}
      </div>
    </div>
  )
}
