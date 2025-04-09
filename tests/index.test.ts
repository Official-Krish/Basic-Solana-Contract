import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { test, expect } from "bun:test";
import { COUNTER_SIZE, schema } from "./types";
import * as borsh from "borsh";

let CounterAccountKeypair: Keypair = Keypair.generate();
let adminKeypair: Keypair = Keypair.generate();

test("account is initialized", async () => {
    const connection = new Connection("http://localhost:8899");
    const txn = await connection.requestAirdrop(adminKeypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(txn);

    const programId = new PublicKey("B5rTDa7r7NoSkWydncMyaW6Ahms6gMQWc1DeXbKvV6H");

    const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE);
    const createAccount = SystemProgram.createAccount({
        fromPubkey: adminKeypair.publicKey,
        newAccountPubkey: CounterAccountKeypair.publicKey,
        lamports,
        space: COUNTER_SIZE,
        programId,
    })
    const tx = new Transaction().add(createAccount);
    const txHash = await connection.sendTransaction(tx, [adminKeypair, CounterAccountKeypair]);
    await connection.confirmTransaction(txHash);
    
    const account = await connection.getAccountInfo(CounterAccountKeypair.publicKey);
    const counter = borsh.deserialize(schema, account?.data!);
    expect(counter?.count).toEqual(0);
})