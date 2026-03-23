import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result.js';
import { Transaction } from '../../domain/entities/index.js';
import type { TransactionRepositoryPort } from '../../domain/ports/outbound/transaction.repository.port.js';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/outbound/transaction.repository.port.js';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Transaction>> {
    const result = await this.transactionRepository.findById(id);
    if (result.isFailure) return Result.fail(result.error);
    if (!result.value) return Result.fail('Transaction not found');
    return Result.ok(result.value);
  }
}
