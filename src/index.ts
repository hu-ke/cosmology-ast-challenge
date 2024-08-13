const t = require("@babel/types");

type QueryConfig = {
    requestType: string;
    responseType: string;
};

type InputType = {
    [key: string]: QueryConfig; // 允许任意字符串作为 key，且值必须是 QueryConfig 类型
};

const generateAST =  (input: InputType) => {
    const [key, {requestType, responseType}] = Object.entries(input)[0]

    const interfaceDeclaration = t.tsInterfaceDeclaration(
        t.identifier(`Use${key}Query`),
        t.tsTypeParameterDeclaration([t.tsTypeParameter(
            null,
            null,
            "TData"
        )]), 
        [
            t.tsExpressionWithTypeArguments(
                t.identifier("ReactQueryParams"),
                t.tsTypeParameterInstantiation([
                    t.tsTypeReference(t.identifier(responseType)),
                    t.tsTypeReference(t.identifier("TData")),
                ])
            )
        ],
        t.tsInterfaceBody([
            t.tsPropertySignature(
                t.identifier("request"),
                t.tsTypeAnnotation(t.tsTypeReference(t.identifier(`Query${key}Request`))),
            )
    
        ]),
        [
            t.tsTypeParameterInstantiation([
                t.tsTypeReference(t.identifier(responseType)),
                t.tsTypeReference(t.identifier("TData")),
            ]),
        ]
    )

    // Mark 'request' as optional
    interfaceDeclaration.body.body[0].optional = true;
    const interfaceNode = t.exportNamedDeclaration(interfaceDeclaration);

    // Define the TData type parameter with a default of QueryPoolsResponse
    const typeParameterDeclaration = t.tsTypeParameterDeclaration([
            t.tsTypeParameter(
                t.tsTypeReference(t.identifier("TData")),
                t.tsTypeReference(t.identifier(responseType)),
                ''
            ),
        ])

    const functionParams = [
        t.objectPattern([
            t.objectProperty(t.identifier("request"), t.identifier("request"), false, true),
            t.objectProperty(t.identifier("options"), t.identifier("options"), false, true),
        ]),
    ]
    const functionBody = t.blockStatement([
        t.returnStatement(
            t.callExpression(t.identifier("useQuery"), [
                t.arrayExpression([
                    t.stringLiteral(`${key.toLowerCase()}Query`),
                    t.identifier("request"),
                ]),
                t.arrowFunctionExpression(
                    [],
                    t.blockStatement([
                        t.ifStatement(
                            t.unaryExpression("!", t.identifier("queryService")),
                            t.throwStatement(
                                t.newExpression(t.identifier("Error"), [
                                    t.stringLiteral("Query Service not initialized"),
                                ])
                            )
                        ),
                        t.returnStatement(
                            t.callExpression(
                                t.memberExpression(
                                    t.identifier("queryService"),
                                    t.identifier(key.toLowerCase())
                                ),
                                [t.identifier("request")]
                            )
                        ),
                    ])
                ),
                t.identifier("options"),
            ])
        ),
    ])
    const arrowFunctionExpression = t.arrowFunctionExpression(
        functionParams,
        functionBody,
    )
    // Attach the type parameters to the arrow function
    arrowFunctionExpression.typeParameters = typeParameterDeclaration;
    // Define the type annotation for the parameters: UsePoolsQuery<TData>
    const paramTypeAnnotation = t.tsTypeAnnotation(
        t.tsTypeReference(
            t.identifier("UsePoolsQuery"),
            t.tsTypeParameterInstantiation([
                t.tsTypeReference(t.identifier("TData"))
            ])
        )
    );
    functionParams[0].typeAnnotation = paramTypeAnnotation;

    // Attach type arguments to `useQuery` call
    const useQueryCall = functionBody.body[0].argument;
    useQueryCall.typeParameters = t.tsTypeParameterInstantiation([
        t.tsTypeReference(t.identifier("QueryPoolsResponse")),
        t.tsTypeReference(t.identifier("Error")),
        t.tsTypeReference(t.identifier("TData")),
    ]);


    const constNode = t.variableDeclaration("const", [
        t.variableDeclarator(
            t.identifier(`use${key}`),
            arrowFunctionExpression
        ),
    ]);

    const ast = t.program([interfaceNode, constNode]);
    return ast
    // return generate(ast, { /* options */ }).code;
}

// const param = {
//     "Pools": {
//         "requestType": "QueryPoolsRequest",
//         "responseType": "QueryPoolsResponse",
//     }
//   }

// let ast = generateAST(param)
// let code = generate(ast, {}).code;
// console.log(code)
export default generateAST
