import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WompiAdapter } from './wompi.adapter';

describe('WompiAdapter', () => {
  let adapter: WompiAdapter;
  let configService: ConfigService;
  let httpService: HttpService;

  const mockAxiosResponse = <T>(data: T): AxiosResponse<T> =>
    ({ data, status: 200, statusText: 'OK', headers: {}, config: {} }) as AxiosResponse<T>;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const values: Record<string, string> = {
          WOMPI_API_URL: 'https://api-sandbox.co.uat.wompi.dev/v1',
          WOMPI_PUBLIC_KEY: 'public-key',
          WOMPI_PRIVATE_KEY: 'private-key',
          WOMPI_INTEGRITY_KEY: 'integrity-key',
        };

        return values[key] ?? defaultValue ?? '';
      }),
    } as never;

    httpService = {
      get: jest.fn(),
      post: jest.fn(),
    } as never;

    adapter = new WompiAdapter(configService, httpService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('gets acceptance token', async () => {
    (httpService.get as jest.Mock).mockReturnValue(
      of(
        mockAxiosResponse({
          data: {
            presigned_acceptance: {
              acceptance_token: 'acceptance-token',
            },
          },
        }),
      ),
    );

    const result = await adapter.getAcceptanceToken();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe('acceptance-token');
  });

  it('tokenizes card', async () => {
    (httpService.post as jest.Mock).mockReturnValue(
      of(
        mockAxiosResponse({
          data: { id: 'card-token' },
        }),
      ),
    );

    const result = await adapter.tokenizeCard({
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '30',
      cardHolder: 'John Doe',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe('card-token');
  });

  it('creates payment transaction', async () => {
    (httpService.post as jest.Mock).mockReturnValue(
      of(
        mockAxiosResponse({
          data: {
            id: 'wompi-1',
            status: 'APPROVED',
            reference: 'tx-1',
            amount_in_cents: 6500000,
          },
        }),
      ),
    );

    const result = await adapter.createTransaction({
      amountInCents: 6500000,
      currency: 'COP',
      customerEmail: 'john@example.com',
      reference: 'tx-1',
      paymentMethodToken: 'card-token',
      acceptanceToken: 'acceptance-token',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe('APPROVED');
  });

  it('gets payment transaction by id', async () => {
    (httpService.get as jest.Mock).mockReturnValue(
      of(
        mockAxiosResponse({
          data: {
            id: 'wompi-1',
            status: 'PENDING',
            reference: 'tx-1',
            amount_in_cents: 6500000,
          },
        }),
      ),
    );

    const result = await adapter.getTransaction('wompi-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value.reference).toBe('tx-1');
  });

  it('returns failure when gateway response is invalid', async () => {
    (httpService.post as jest.Mock).mockReturnValue(
      of(mockAxiosResponse({ data: {} })),
    );

    const result = await adapter.createTransaction({
      amountInCents: 6500000,
      currency: 'COP',
      customerEmail: 'john@example.com',
      reference: 'tx-1',
      paymentMethodToken: 'card-token',
      acceptanceToken: 'acceptance-token',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Failed to create payment transaction');
  });

  it('returns failure when http call throws', async () => {
    (httpService.get as jest.Mock).mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const result = await adapter.getAcceptanceToken();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Failed to communicate with payment gateway');
  });
});
