///<reference path="externals/lodash/lodash.d.ts"/>
var Q3;
(function (Q3) {
    var FoundSolutions = (function () {
        function FoundSolutions(solutions) {
            this.solutions = solutions;
        }
        return FoundSolutions;
    })();
    var EquationsSolver = (function () {
        function EquationsSolver() {
        }
        EquationsSolver.prototype.solveNonlinear = function (equations, variables) {
            var _this = this;
            if (variables === void 0) { variables = ['x', 'y', 'z']; }
            if (variables.length > 3) {
                throw new Error("Currently only up to three variables are supported");
            }
            try {
                equations = _.cloneDeep(equations);
                var sq = function (x) { return x * x; };
                var EPS = 1e-6;
                var isZero = function (x) { return Math.abs(x) < EPS; };
                var isConstant = function (x) { return x === '=' || x === '1'; };
                var isVariable = function (x) { return 0 <= variables.indexOf(x); };
                var isNonlinearAtom = function (x) { return !isVariable(x) && !isConstant(x); };
                var isLinearEquation = function (eq) { return !_.any(_.keys(eq), isNonlinearAtom); };
                var extractVariablesFromAtom = function (atom) { return isVariable(atom[0]) ? (isVariable(atom[1]) ? [atom[0], atom[1]] : [atom[0]]) : []; };
                var nonlinearEquations = equations;
                var linearEquations = [];
                var timesVariable = function (var1, var2) {
                    if (var1 === '1') {
                        return var2;
                    }
                    else if (var2 === '1') {
                        return var1;
                    }
                    else if (var1 == var2) {
                        return var1 + '^2';
                    }
                    else if (var1 < var2) {
                        return var1 + var2;
                    }
                    else {
                        return var2 + var1;
                    }
                };
                //this procedure removes terms with coefficient equal to zero,
                //removes equations of the form 0=0
                //signals equations of the form 0=c , where c!=0
                //splits equations into linearEquations and nonlinearEquations
                var cleanUp = function () {
                    equations = nonlinearEquations.concat(linearEquations);
                    nonlinearEquations = [];
                    linearEquations = [];
                    _.each(equations, function (equation) {
                        _.each(equation, function (value, atom) {
                            if (isZero(value)) {
                                delete equation[atom];
                            }
                            else {
                                if (isNonlinearAtom(atom)) {
                                    var atomVariables = extractVariablesFromAtom(atom);
                                    if (atomVariables.length == 2) {
                                        var correctAtom = timesVariable(atomVariables[0], atomVariables[1]);
                                        if (atom != correctAtom) {
                                            delete equation[atom];
                                            equation[correctAtom] = (equation[correctAtom] || 0) + value;
                                        }
                                    }
                                }
                            }
                        });
                        if (equation['=']) {
                            equation['1'] = -equation['='];
                            delete equation['='];
                        }
                        if (!equation['1']) {
                            equation['1'] = 0;
                        }
                        if (_.keys(equation).length === 1) {
                            if (equation['1']) {
                                // 0 != 0
                                throw new RangeError("One of equations is infeasible");
                            } //else: ignore this 0=0
                        }
                        else {
                            if (isLinearEquation(equation)) {
                                linearEquations.push(equation);
                            }
                            else {
                                nonlinearEquations.push(equation);
                            }
                        }
                    });
                    equations = nonlinearEquations.concat(linearEquations);
                };
                var eliminateAtomFromEquation = function (equation, eliminatingEquation, eliminatedAtom) {
                    if (equation[eliminatedAtom]) {
                        var s1 = eliminatingEquation[eliminatedAtom];
                        var s2 = equation[eliminatedAtom];
                        _.each(equation, function (value, atom) {
                            equation[atom] = value * s1;
                        });
                        _.each(eliminatingEquation, function (value, atom) {
                            equation[atom] = (equation[atom] || 0) - value * s2;
                        });
                    }
                };
                //This procedure eliminates the eliminatedAtom (be it a variable, or nonlinear atom)
                //from equations other than eliminatingEquation
                //using eliminatingEquation as definition for eliminatedAtom replacement.
                //Please note, that eliminating "x" does not eliminate "x^2" nor "xy", just "x".
                var eliminateAtom = function (eliminatingEquation, eliminatedAtom) {
                    _.each(equations, function (equation) {
                        if (equation != eliminatingEquation) {
                            eliminateAtomFromEquation(equation, eliminatingEquation, eliminatedAtom);
                        }
                    });
                    cleanUp();
                };
                var timesEquation = function (variable, equation) {
                    var newEquation = {};
                    _.each(equation, function (value, atom) {
                        newEquation[timesVariable(variable, atom)] = value;
                    });
                    return newEquation;
                };
                //This is somewhat similar to eliminateAtom, but it also replaces instances of variable
                //in nonlinear atoms. For example if x=y+z, then x^2 becomes (y^2+z^2+yz).
                var eliminateVariable = function (eliminatingEquation, eliminatedVariable) {
                    eliminateAtom(eliminatingEquation, eliminatedVariable);
                    var helperEquations = _.zipObject(variables, _.map(variables, function (variable) { return timesEquation(variable, eliminatingEquation); }));
                    eliminateAtomFromEquation(helperEquations[eliminatedVariable], eliminatingEquation, eliminatedVariable);
                    _.each(helperEquations, function (helperEquation, variable) {
                        if (variable != eliminatedVariable) {
                            eliminateAtomFromEquation(helperEquations[eliminatedVariable], helperEquation, timesVariable(variable, eliminatedVariable));
                        }
                    });
                    _.each(nonlinearEquations, function (equation) {
                        _.each(helperEquations, function (helperEquation, variable) {
                            eliminateAtomFromEquation(equation, helperEquation, timesVariable(variable, eliminatedVariable));
                        });
                    });
                    cleanUp();
                };
                //Phase 0:
                //Clean up user provided data, and initially partition into linear/nonlinear.
                cleanUp();
                //Phase 1:
                //We simplify nonlinear equations, in hope that there are somewhat redundant.
                //For example if there are multiple sphere equations (of the form x^2+y^2+z^2+...=0)
                //then all of them except one can be reduced to linear equations by subtracting the first one from them.
                var simplifyNonlinearEquations = function () {
                    _.each(nonlinearEquations, function (equation) {
                        var nonlinearAtom = _.find(_.keys(equation), isNonlinearAtom);
                        if (nonlinearAtom) {
                            eliminateAtom(equation, nonlinearAtom);
                        }
                    });
                    //If there is a nonlinear equation which uses only single variable
                    //(that is: ax^2+bx+c=0)
                    //then we can solve this equation
                    _.each(nonlinearEquations, function (equation) {
                        var equationVariables = _.uniq(_.flatten(_.map(_.keys(equation), extractVariablesFromAtom)));
                        if (equationVariables.length === 1) {
                            var variable = equationVariables[0];
                            var a = equation[timesVariable(variable, variable)];
                            var b = equation[variable] || 0;
                            var c = equation['1'];
                            var delta = sq(b) - 4 * a * c;
                            var replace = function (value) {
                                var newEquation = { '=': value };
                                newEquation[variable] = 1;
                                return _.without(equations, equation).concat(newEquation);
                            };
                            if (isZero(delta)) {
                                var value = -b / (2 * a);
                                throw new FoundSolutions(_this.solveNonlinear(replace(value), variables));
                            }
                            else if (delta < 0) {
                                throw new FoundSolutions([]);
                            }
                            else {
                                var value1 = (-b + Math.sqrt(delta)) / (2 * a);
                                var value2 = (-b - Math.sqrt(delta)) / (2 * a);
                                throw new FoundSolutions(_this.solveNonlinear(replace(value1), variables).concat(_this.solveNonlinear(replace(value2), variables)));
                            }
                        }
                    });
                    cleanUp();
                };
                simplifyNonlinearEquations();
                while (true) {
                    //Phase 2:
                    //At this point we have the equations separated into linear and nonlinear.
                    //We want to simplify the linearEquations set, in hope that they are redundant.
                    //Our goal is to end up with an independent set of linear equations.
                    _.each(linearEquations, function (equation) {
                        var variable = _.find(_.keys(equation), isVariable);
                        if (variable) {
                            eliminateAtom(equation, variable);
                        } //else -- we did not find a variable, probably because we iterate over old linearEquations and equation could get reduced to 0=0
                    });
                    //Phase 3:
                    //At this point we have a set of independent linear equations. There are several cases:
                    //a) the set is empty :(
                    //b) the set contains a single equation, ax+by+cz=d. There are two subcases, which slightly differ in difficulty :
                    //   b1) At least one of a,b, or c is zero. In this case we can eliminate one of variables, even from nonlinear terms, replacing it with another
                    //   b2) All of a,b and c are non-zero. We live on a plane. This still lets us eliminate a variable, but this time this is a bit harder,
                    //       as for example x^2 becomes now (d-by-cz)^2/a^2 which introduces a new nonlinear atom: yz.
                    //       This can lead us later to report a conic equation with such a term as a solution, which generaly makes life harder.
                    //       We can still hope for a simple case: if there is a variable such that it does not appear in nonlinear terms, (say: x) then we can
                    //       eliminate that particular variable.
                    //       In this simpler case, we still may have nonlinear equations, but there will be no dreaded "yz" term.
                    //c) the set contains two equations. At least one of them involves only single variable, and at most one of them involves two.
                    //   We can use these two equations to eliminate two variables from nonlinear equations:)
                    //d) the life is beautiful and we have three equations, so we have a single candidate point
                    //Each of this cases leads us to the same strategy:
                    //simply loop through linearEquations in whatever order, and use each equation to eliminate a single variable.
                    //When in doubt, which one to eliminate, use the one which does not occur in nonlinear terms, to make life easier.
                    var nonlinearVariables = _.uniq(_.flatten(_.map(nonlinearEquations, function (equation) { return _.flatten(_.map(_.filter(_.keys(equation), isNonlinearAtom), extractVariablesFromAtom)); })));
                    var nonlinearEquationsCount = nonlinearEquations.length;
                    _.each(linearEquations, function (equation) {
                        var variables = _.filter(_.keys(equation), isVariable);
                        var bestVariables = _.difference(variables, nonlinearVariables);
                        var variable = bestVariables[0] || variables[0];
                        if (variable) {
                            eliminateVariable(equation, variable);
                        } //else -- we did not find a variable, probably because we iterate over old linearEquations and equation could get reduced to 0=0
                    });
                    //Phase 4:
                    //It is possible that by eliminating some variables, we now have two dependent nolinear equations.
                    //For example if we had {x^2 + z^2 + ... =0, y^2 + z^2 +...=0} and we've replace x with y,
                    //then we now have an opportunity to simplify the second equation into linear.
                    simplifyNonlinearEquations();
                    if (nonlinearEquations.length === nonlinearEquationsCount) {
                        //we did not simplify any nonlinear equation to the point of becoming linear or disappearing completely,
                        //so we do not have any fresh linear equations,
                        //so we can not hope to exepct anything new from looping one more time, so..
                        break;
                    }
                }
                //Phase 5:
                //Right now we have simplified everything we could (with my limited knowledge of math:/)
                //What cases are possible?
                //a) no nonlinear equations left
                //   a1) and no linear equation neither. Result: [type:volume, x:any, y:any, z:any]
                //   a2) single linear equation. W.l.o.g. let z have non-zero coefficient. Result [type:plane, x:any, y:any, z:ax+by+c].
                //   a3) two linear equations. Let z appear only in the first, and y only in the second. Result: [type:line, x:any, y=ax+b, z=cx+d].
                //   a4) three linear equations. Result: [type:point, x=number,y=number,z=number]
                //b) a single nonlinear equation left, which involves two variables
                //   b1) and there is one linear equation, which involves the third variable. Result: [type:conic, ax^2+by^2+cxy+dx+ey+f=0, z=gx+hy+i]
                //   b2) and there are no linear equations. Result: [type:conic-surface, ax^2+by^2+cxy+dx+ey+f=0, z=any ]
                //c) a single nonlinear equation left, which involves all three variables.
                //   There are no linear equations (as otherwise we could reduce number of variables)
                //   Result [type: surface, ax^2+by^2+cy^2+dxy+eyz+fxz+gx+hy+iz+j=0]
                //d) at least two nonlinear equations left, which involve only two variables
                //   As these two are independent, we can enforce that at most one of them has xy atom.
                //   Each other equation has to have x^2 or y^2 atom in order to be nonlinear.
                //   We can use such an equation to eliminate at least one of these atoms from the first equation.
                //   Then we can focus on two of these equations, which are (w.l.o.g): {fxy+gy^2+hx+iy+j=0  ,ax^2+by^2+cx+dy+e=0}
                //   and can have up to 4 common points in x-y plane.
                //   We can then check if these points belong to other nonlinear equations as well.
                //   Finally if there is a linear equation, we can compute z for each (x,y) point, or if there is no such equation append z:any.
                //e) at least two nonlinear equations left, which involve all three variables. There are no linear equations.
                //   This is a case, which is beyond my powers :(
                //   For example this happens when you intersect two tubes. http://www.wolframalpha.com/input/?i=x%5E2%2Bz%5E2%2By%2Bz%3D1%2C+y%5E2%2Bz%5E2%2Bx-z%3D1
                //   In this case I am going to just return these equations back to the caller.
                if (!nonlinearEquations.length) {
                    //a)
                    var equationVariables = _.map(linearEquations, function (equation) { return _.filter(_.keys(equation), isVariable); });
                    var uniqueVariables = _.map(equationVariables, function (variables, index) { return _.difference(variables, _.flatten(equationVariables.slice(0, index).concat(equationVariables.slice(index + 1)))); });
                    if (variables.length < linearEquations.length) {
                        throw new Error("Impossible case: more independent linear equations than variables!");
                    }
                    var dimensionalityToType = ['point', 'line', 'plane', 'volume'];
                    var assignment = {};
                    _.each(linearEquations, function (equation, index) {
                        var uniqueVariable = uniqueVariables[index][0];
                        var valueExpression = {};
                        _.each(equation, function (value, atom) {
                            if (atom != uniqueVariable) {
                                valueExpression[atom] = -value / equation[uniqueVariable];
                            }
                        });
                        if (_.keys(valueExpression).length == 1) {
                            valueExpression = valueExpression['1'];
                        }
                        assignment[uniqueVariable] = valueExpression;
                    });
                    return [{ type: dimensionalityToType[variables.length - linearEquations.length], assignment: assignment }];
                }
                else {
                    //TODO b), c), d), e)
                    throw new Error("Currently nonlinear solutions are not supported");
                }
            }
            catch (e) {
                if (e instanceof FoundSolutions) {
                    return e.solutions;
                }
                throw e;
            }
        };
        return EquationsSolver;
    })();
    Q3.EquationsSolver = EquationsSolver;
})(Q3 || (Q3 = {}));
///<reference path="equations_solver.ts"/>
if (typeof require != 'undefined' && typeof exports != 'undefined') {
    var _ = require('lodash');
    exports.EquationsSolver = Q3.EquationsSolver;
}
