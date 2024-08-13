import generate from '@babel/generator';
import generateAST from '../module/index'
import exampleMethods from '../example-methods.json'

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
    for (let key in exampleMethods) {
        const inputJson = {
            [key]: exampleMethods[key]
        }
        expectCode(generateAST(inputJson));
    }
});