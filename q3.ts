///<reference path="equations_solver.ts"/>
declare var require: any;
declare var exports: any;
if (typeof require != 'undefined' && typeof exports != 'undefined') {
  var _ = <_.LoDashStatic>require('lodash');
  exports.EquationsSolver = Q3.EquationsSolver;
}
