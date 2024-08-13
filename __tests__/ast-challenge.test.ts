import babelTraverse from '@babel/traverse';
import { parse, ParserPlugin } from '@babel/parser';
import generate from '@babel/generator';
import * as t from '@babel/types';
import generateAST from '../module/index'

const expectCode = (ast) => {
    // printCode(ast)
    expect(
        generate(ast).code
    ).toMatchSnapshot();
}

const printCode = (ast) => {
    console.log(
        generate(ast).code
    );
}


it('works', () => {
    const inputJson = {
        "Pools": {
            "requestType": "QueryPoolsRequest",
            "responseType": "QueryPoolsResponse"
        }
    }
    expectCode(generateAST(inputJson));
});