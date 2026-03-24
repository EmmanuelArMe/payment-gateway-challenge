import { PaymentController } from './payment.controller';
import { Result } from '../../shared/result';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentGateway: {
    getAcceptanceToken: jest.Mock;
    tokenizeCard: jest.Mock;
    createTransaction: jest.Mock;
    getTransaction: jest.Mock;
  };

  beforeEach(() => {
    paymentGateway = {
      getAcceptanceToken: jest.fn(),
      tokenizeCard: jest.fn(),
      createTransaction: jest.fn(),
      getTransaction: jest.fn(),
    };

    controller = new PaymentController(paymentGateway);
  });

  it('returns acceptance token', async () => {
    paymentGateway.getAcceptanceToken.mockResolvedValue(
      Result.ok('accept-tok-123'),
    );

    const result = await controller.getAcceptanceToken();

    expect(result).toEqual({ data: 'accept-tok-123' });
  });

  it('throws when acceptance token fails', async () => {
    paymentGateway.getAcceptanceToken.mockResolvedValue(
      Result.fail('gateway error'),
    );

    await expect(controller.getAcceptanceToken()).rejects.toThrow(
      'gateway error',
    );
  });

  it('tokenizes a card', async () => {
    paymentGateway.tokenizeCard.mockResolvedValue(Result.ok('card-tok-456'));

    const result = await controller.tokenizeCard({
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '30',
      cardHolder: 'John Doe',
    });

    expect(result).toEqual({ data: 'card-tok-456' });
    expect(paymentGateway.tokenizeCard).toHaveBeenCalledWith({
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '30',
      cardHolder: 'John Doe',
    });
  });

  it('throws when tokenize fails', async () => {
    paymentGateway.tokenizeCard.mockResolvedValue(
      Result.fail('tokenize error'),
    );

    await expect(
      controller.tokenizeCard({
        number: '4242424242424242',
        cvc: '123',
        expMonth: '12',
        expYear: '30',
        cardHolder: 'John Doe',
      }),
    ).rejects.toThrow('tokenize error');
  });
});
