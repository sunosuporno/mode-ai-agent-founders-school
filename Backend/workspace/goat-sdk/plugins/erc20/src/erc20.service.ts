import { Tool } from '@goat-sdk/core';
import { EVMWalletClient } from '@goat-sdk/wallet-evm';
import { ERC20_ABI } from './abi';
import {
  ApproveParameters,
  ConvertFromBaseUnitParameters,
  ConvertToBaseUnitParameters,
  GetTokenAllowanceParameters,
  GetTokenBalanceParameters,
  GetTokenInfoBySymbolParameters,
  GetTokenTotalSupplyParameters,
  RevokeApprovalParameters,
  TransferFromParameters,
  TransferParameters,
} from './parameters';
import { Token } from './token';

export class Erc20Service {
  private tokens: Token[];

  constructor({ tokens }: { tokens?: Token[] } = {}) {
    this.tokens = tokens ?? [];
  }

  @Tool({
    description:
      'Get the ERC20 token info by its symbol, including the contract address, decimals, and name',
  })
  async getTokenInfoBySymbol(
    walletClient: EVMWalletClient,
    parameters: GetTokenInfoBySymbolParameters,
  ) {
    const token = this.tokens.find((token) =>
      [token.symbol, token.symbol.toLowerCase()].includes(parameters.symbol),
    );

    if (!token) {
      throw Error(`Token with symbol ${parameters.symbol} not found`);
    }

    const chain = walletClient.getChain();

    const contractAddress = token.chains[chain.id]?.contractAddress;

    if (!contractAddress) {
      throw Error(
        `Token with symbol ${parameters.symbol} not found on chain ${chain.id}`,
      );
    }

    return {
      symbol: token?.symbol,
      contractAddress,
      decimals: token?.decimals,
      name: token?.name,
    };
  }

  @Tool({
    description:
      'Get the balance of an ERC20 token in base units and its USD value.',
  })
  async getTokenBalance(
    walletClient: EVMWalletClient,
    parameters: GetTokenBalanceParameters,
  ) {
    try {
      const resolvedWalletAddress = await walletClient.resolveAddress(
        parameters.wallet,
      );

      const rawBalance = await walletClient.read({
        address: parameters.tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [resolvedWalletAddress],
      });

      // Get price feed ID from Pyth
      const pythResponse = await fetch(
        `https://hermes.pyth.network/v2/price_feeds?query=${parameters.name.toLowerCase()}&asset_type=crypto`,
      );
      const pythData = await pythResponse.json();

      if (!pythData[0]?.id) {
        return {
          balance: rawBalance.value.toString(),
          valueUSD: null,
          error: 'Price feed not found',
        };
      }

      // Get latest price from Pyth
      const priceResponse = await fetch(
        `https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${pythData[0].id}&encoding=hex&parsed=true`,
      );
      const priceData = await priceResponse.json();

      // Calculate USD value
      const price = Number(priceData.parsed[0].price.price) / 1e8;
      const balanceInTokens =
        Number(rawBalance.value) / 10 ** parameters.tokenDecimals;
      const valueUSD = balanceInTokens * price;

      return {
        balance: rawBalance.value.toString(),
        valueUSD: valueUSD.toFixed(2),
      };
    } catch (error) {
      console.error('Error fetching balance and price:', error);
      return {
        balance: '0',
        valueUSD: null,
        error: `Failed to fetch balance and price: ${error}`,
      };
    }
  }

  @Tool({
    description: 'Transfer an amount of an ERC20 token to an address',
  })
  async transfer(
    walletClient: EVMWalletClient,
    parameters: TransferParameters,
  ) {
    try {
      const to = await walletClient.resolveAddress(parameters.to);

      const hash = await walletClient.sendTransaction({
        to: parameters.tokenAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, parameters.amount],
      });
      return hash.hash;
    } catch (error) {
      throw Error(`Failed to transfer: ${error}`);
    }
  }

  @Tool({
    description: 'Get the total supply of an ERC20 token',
  })
  async getTokenTotalSupply(
    walletClient: EVMWalletClient,
    parameters: GetTokenTotalSupplyParameters,
  ) {
    try {
      const rawTotalSupply = await walletClient.read({
        address: parameters.tokenAddress,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      });

      return rawTotalSupply.value;
    } catch (error) {
      throw Error(`Failed to fetch total supply: ${error}`);
    }
  }

  @Tool({
    description: 'Get the allowance of an ERC20 token',
  })
  async getTokenAllowance(
    walletClient: EVMWalletClient,
    parameters: GetTokenAllowanceParameters,
  ) {
    try {
      const owner = await walletClient.resolveAddress(parameters.owner);
      const spender = await walletClient.resolveAddress(parameters.spender);

      const rawAllowance = await walletClient.read({
        address: parameters.tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner, spender],
      });
      return Number(rawAllowance.value);
    } catch (error) {
      throw Error(`Failed to fetch allowance: ${error}`);
    }
  }

  @Tool({
    description: 'Approve an amount of an ERC20 token to an address',
  })
  async approve(walletClient: EVMWalletClient, parameters: ApproveParameters) {
    try {
      const spender = await walletClient.resolveAddress(parameters.spender);

      const hash = await walletClient.sendTransaction({
        to: parameters.tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, parameters.amount],
      });
      return hash.hash;
    } catch (error) {
      throw Error(`Failed to approve: ${error}`);
    }
  }

  @Tool({
    description: 'Revoke approval for an ERC20 token to an address',
  })
  async revokeApproval(
    walletClient: EVMWalletClient,
    parameters: RevokeApprovalParameters,
  ) {
    try {
      const spender = await walletClient.resolveAddress(parameters.spender);

      const hash = await walletClient.sendTransaction({
        to: parameters.tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, 0],
      });
      return hash.hash;
    } catch (error) {
      throw Error(`Failed to revoke approval: ${error}`);
    }
  }

  @Tool({
    description:
      'Transfer an amount of an ERC20 token from an address to another address',
  })
  async transferFrom(
    walletClient: EVMWalletClient,
    parameters: TransferFromParameters,
  ) {
    try {
      const from = await walletClient.resolveAddress(parameters.from);
      const to = await walletClient.resolveAddress(parameters.to);

      const hash = await walletClient.sendTransaction({
        to: parameters.tokenAddress,
        abi: ERC20_ABI,
        functionName: 'transferFrom',
        args: [from, to, parameters.amount],
      });
      return hash.hash;
    } catch (error) {
      throw Error(`Failed to transfer from: ${error}`);
    }
  }

  @Tool({
    description: 'Convert an amount of an ERC20 token to its base unit',
  })
  async convertToBaseUnit(parameters: ConvertToBaseUnitParameters) {
    const { amount, decimals } = parameters;
    const baseUnit = amount * 10 ** decimals;
    return Number(baseUnit);
  }

  @Tool({
    description:
      'Convert an amount of an ERC20 token from its base unit to its decimal unit',
  })
  async convertFromBaseUnit(parameters: ConvertFromBaseUnitParameters) {
    const { amount, decimals } = parameters;
    const decimalUnit = amount / 10 ** decimals;
    return Number(decimalUnit);
  }
}
