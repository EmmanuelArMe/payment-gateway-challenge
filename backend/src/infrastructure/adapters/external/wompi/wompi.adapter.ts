import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentGatewayPort,
  TokenizeCardData,
  CreateWompiTransactionData,
  WompiTransactionResult,
} from '../../../../domain/ports/outbound/payment-gateway.port.js';
import { Result } from '../../../../shared/result.js';

@Injectable()
export class WompiAdapter implements PaymentGatewayPort {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('WOMPI_API_URL', 'https://api-sandbox.co.uat.wompi.dev/v1');
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY', '');
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY', '');
  }

  async getAcceptanceToken(): Promise<Result<string>> {
    try {
      const response = await fetch(`${this.baseUrl}/merchants/${this.publicKey}`);
      const data = await response.json() as { data?: { presigned_acceptance?: { acceptance_token?: string } } };
      const token = data?.data?.presigned_acceptance?.acceptance_token;
      if (!token) {
        return Result.fail('Failed to get acceptance token');
      }
      return Result.ok(token);
    } catch (error) {
      return Result.fail('Failed to communicate with payment gateway');
    }
  }

  async tokenizeCard(data: TokenizeCardData): Promise<Result<string>> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.publicKey}`,
        },
        body: JSON.stringify({
          number: data.number,
          cvc: data.cvc,
          exp_month: data.expMonth,
          exp_year: data.expYear,
          card_holder: data.cardHolder,
        }),
      });

      const result = await response.json() as { data?: { id?: string }; error?: { messages?: unknown } };
      if (!result?.data?.id) {
        return Result.fail('Failed to tokenize card');
      }
      return Result.ok(result.data.id);
    } catch (error) {
      return Result.fail('Failed to tokenize card');
    }
  }

  async createTransaction(data: CreateWompiTransactionData): Promise<Result<WompiTransactionResult>> {
    try {
      const body: Record<string, unknown> = {
        amount_in_cents: data.amountInCents,
        currency: data.currency,
        customer_email: data.customerEmail,
        reference: data.reference,
        acceptance_token: data.acceptanceToken,
        payment_method: {
          type: 'CARD',
          token: data.paymentMethodToken,
          installments: 1,
        },
      };

      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json() as {
        data?: { id?: string; status?: string; reference?: string; amount_in_cents?: number };
        error?: unknown;
      };

      if (!result?.data?.id) {
        return Result.fail('Failed to create payment transaction');
      }

      return Result.ok({
        id: result.data.id,
        status: result.data.status || 'PENDING',
        reference: result.data.reference || data.reference,
        amountInCents: result.data.amount_in_cents || data.amountInCents,
      });
    } catch (error) {
      return Result.fail('Failed to create payment transaction');
    }
  }

  async getTransaction(transactionId: string): Promise<Result<WompiTransactionResult>> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
        },
      });

      const result = await response.json() as {
        data?: { id?: string; status?: string; reference?: string; amount_in_cents?: number };
      };

      if (!result?.data?.id) {
        return Result.fail('Transaction not found in payment gateway');
      }

      return Result.ok({
        id: result.data.id,
        status: result.data.status || 'PENDING',
        reference: result.data.reference || '',
        amountInCents: result.data.amount_in_cents || 0,
      });
    } catch (error) {
      return Result.fail('Failed to get payment transaction');
    }
  }
}
