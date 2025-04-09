import * as borch from "borsh";

export class CounterAccount {
    count: number;
    constructor({count}: {count: number}) {
        this.count = count;
    }
}

export const schema: borch.Schema = {
    struct: {
        count: "u32",
    }
}

export const COUNTER_SIZE = borch.serialize(schema, new CounterAccount({count: 0})).length;