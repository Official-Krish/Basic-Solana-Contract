import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { test, expect } from "bun:test";
import { COUNTER_SIZE, schema } from "./types";
import * as borsh from "borsh";

let CounterAccountKeypair: Keypair = Keypair.generate();
let adminKeypair: Keypair = Keypair.generate();
const programId = new PublicKey("2PqBAFFXqy7vuJMkZaferCinMj8ed3RATbsMXMzLwEWY");
const connection = new Connection("http://localhost:8899");

test("account is initialized", async () => {
    const txn = await connection.requestAirdrop(adminKeypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(txn);

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

test("increment", async () => {
    const txn =  new Transaction();
    txn.add(new TransactionInstruction({
        keys: [{
            pubkey: CounterAccountKeypair.publicKey,
            isSigner: false,
            isWritable: true
        }],
        programId,
        data: Buffer.from(new Uint8Array([0, 1, 0, 0, 0]))
    }));
    const txHash = await connection.sendTransaction(txn, [adminKeypair]);
    await connection.confirmTransaction(txHash);

    const account = await connection.getAccountInfo(CounterAccountKeypair.publicKey);
    const counter = borsh.deserialize(schema, account?.data!);
    expect(counter?.count).toBe(1);
});

test("decrement", async () => {
    const txn =  new Transaction();
    txn.add(new TransactionInstruction({
        keys: [{
            pubkey: CounterAccountKeypair.publicKey,
            isSigner: false,
            isWritable: true
        }],
        programId,
        data: Buffer.from(new Uint8Array([1, 1, 0, 0, 0]))
    }));
    const txHash = await connection.sendTransaction(txn, [adminKeypair]);
    await connection.confirmTransaction(txHash);

    const account = await connection.getAccountInfo(CounterAccountKeypair.publicKey);
    const counter = borsh.deserialize(schema, account?.data!);
    expect(counter?.count).toBe(0);
});