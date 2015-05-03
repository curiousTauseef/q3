/// <reference path="externals/lodash/lodash.d.ts" />
declare module Q3 {
    class EquationsSolver {
        solveNonlinear(equations: {
            [key: string]: number;
        }[], variables?: string[]): any[];
    }
}
