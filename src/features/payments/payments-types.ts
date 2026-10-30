export type PaymentStep = 1 | 2 | 3;

export type PaymentMethodType = 'center_code' | 'vodafone_instapay';

export interface PaymentDetails {
  method: PaymentMethodType;
  code?: string;
  senderPhone?: string;
  transactionRef?: string;
  receiptFileName?: string;
}
