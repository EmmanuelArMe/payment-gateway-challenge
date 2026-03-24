import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { createHash } from 'crypto';
import { firstValueFrom } from 'rxjs';
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
  private readonly integrityKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'WOMPI_API_URL',
      'https://api-sandbox.co.uat.wompi.dev/v1',
    );
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY', '');
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY', '');
    this.integrityKey = this.configService.get<string>(
      'WOMPI_INTEGRITY_KEY',
      '',
    );
  }

  async getAcceptanceToken(): Promise<Result<string>> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<{
          data?: { presigned_acceptance?: { acceptance_token?: string } };
        }>(`${this.baseUrl}/merchants/${this.publicKey}`),
      );
      const token = data?.data?.presigned_acceptance?.acceptance_token;
      if (!token) {
        return Result.fail('Failed to get acceptance token');
      }
      return Result.ok(token);
    } catch {
      return Result.fail('Failed to communicate with payment gateway');
    }
  }

  async tokenizeCard(cardData: TokenizeCardData): Promise<Result<string>> {
    try {
      const { data: result } = await firstValueFrom(
        this.httpService.post<{
          data?: { id?: string };
          error?: { messages?: unknown };
        }>(
          `${this.baseUrl}/tokens/cards`,
          {
            number: cardData.number,
            cvc: cardData.cvc,
            exp_month: cardData.expMonth,
            exp_year: cardData.expYear,
            card_holder: cardData.cardHolder,
          },
          {
            headers: { Authorization: `Bearer ${this.publicKey}` },
          },
        ),
      );
      if (!result?.data?.id) {
        return Result.fail('Failed to tokenize card');
      }
      return Result.ok(result.data.id);
    } catch {
      return Result.fail('Failed to tokenize card');
    }
  }

  async createTransaction(
    data: CreateWompiTransactionData,
  ): Promise<Result<WompiTransactionResult>> {
    try {
      // Generate integrity signature: SHA-256(reference + amount_in_cents + currency + integrity_key)
      const signatureString = `${data.reference}${data.amountInCents}${data.currency}${this.integrityKey}`;
      const signature = createHash('sha256')
        .update(signatureString)
        .digest('hex');

      const body: Record<string, unknown> = {
        amount_in_cents: data.amountInCents,
        currency: data.currency,
        customer_email: data.customerEmail,
        reference: data.reference,
        acceptance_token: data.acceptanceToken,
        signature,
        payment_method: {
          type: 'CARD',
          token: data.paymentMethodToken,
          installments: 1,
        },
      };

      const { data: result } = await firstValueFrom(
        this.httpService.post<{
          data?: {
            id?: string;
            status?: string;
            reference?: string;
            amount_in_cents?: number;
          };
          error?: unknown;
        }>(`${this.baseUrl}/transactions`, body, {
          headers: { Authorization: `Bearer ${this.privateKey}` },
        }),
      );

      if (!result?.data?.id) {
        console.error('Wompi createTransaction error:', JSON.stringify(result));
        return Result.fail('Failed to create payment transaction');
      }

      return Result.ok({
        id: result.data.id,
        status: result.data.status || 'PENDING',
        reference: result.data.reference || data.reference,
        amountInCents: result.data.amount_in_cents || data.amountInCents,
      });
    } catch {
      return Result.fail('Failed to create payment transaction');
    }
  }

  async getTransaction(
    transactionId: string,
  ): Promise<Result<WompiTransactionResult>> {
    try {
      const { data: result } = await firstValueFrom(
        this.httpService.get<{
          data?: {
            id?: string;
            status?: string;
            reference?: string;
            amount_in_cents?: number;
          };
        }>(`${this.baseUrl}/transactions/${transactionId}`, {
          headers: { Authorization: `Bearer ${this.privateKey}` },
        }),
      );

      if (!result?.data?.id) {
        return Result.fail('Transaction not found in payment gateway');
      }

      return Result.ok({
        id: result.data.id,
        status: result.data.status || 'PENDING',
        reference: result.data.reference || '',
        amountInCents: result.data.amount_in_cents || 0,
      });
    } catch {
      return Result.fail('Failed to get payment transaction');
    }
  }
}
