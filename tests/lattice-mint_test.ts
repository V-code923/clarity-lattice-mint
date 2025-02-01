import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure can mint lattice NFT with valid parameters",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("lattice-mint", "mint-lattice", [
        types.ascii("square"),
        types.list([{x: types.uint(0), y: types.uint(0)}]),
        types.list([{from: types.uint(0), to: types.uint(1)}]),
        types.ascii("Test Lattice"),
        types.ascii("Test Description"),
        types.list([{trait: types.ascii("color"), value: types.ascii("blue")}])
      ], wallet_1.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
  },
});

Clarinet.test({
  name: "Ensure can transfer lattice NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    const wallet_2 = accounts.get("wallet_2")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("lattice-mint", "mint-lattice", [...], wallet_1.address),
      Tx.contractCall("lattice-mint", "transfer", [
        types.uint(1),
        types.principal(wallet_1.address),
        types.principal(wallet_2.address)
      ], wallet_1.address)
    ]);

    assertEquals(block.receipts.length, 2);
    assertEquals(block.receipts[1].result.expectOk(), true);
  },
});

Clarinet.test({
  name: "Ensure can get lattice data",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("lattice-mint", "mint-lattice", [...], wallet_1.address)
    ]);

    let result = chain.callReadOnlyFn(
      "lattice-mint",
      "get-lattice-data",
      [types.uint(1)],
      wallet_1.address
    );

    assertEquals(result.result.expectOk().expectSome().pattern-type, "square");
  },
});
