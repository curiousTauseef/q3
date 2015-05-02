# q3

This is a Javascript library written in TypeScript for solving quadratic equations sets which arise from geometric problems.
For example if you try to intersect two circles on a plane, you can describe this situation as
two equations which contain terms like x^2 and y^2, which makes this non-linear.
It also means that there can be multiple solutions.

I've called it q3, because it involves quadratic equations in 3 dimensions.

In general solving sets of quadratic equations is an NP-hard problem (due to the fact x^2=x lets you force x to be 0 or 1).
We sidestep this problem by limiting ourselves to at most 3 variables: x,y and z.

One may ask, what does it even mean to solve such an equation set?
The answer is obvious when equations describe a single point: we can just provide its coordinates, for example `{x:1,y:2}`.
If there are multiple points as in {x^2=9, y=3}, then we can just return a list of them, for example `[{x:3,y:3},{x:-3,y:3}]`.
If it is a line, or plane, we need some convention. 
I've decided to represent expressions such as "3y+5" as `{"y":3,"1":5}`.
This alows me to describe a line "x=3y+5, z=2y+3" as `{"x":{"y":3,"1":5},"z":{"y":2,"1":3}}`.

But what if the result is an eliptic curve {x^2+2y^2=7}, or hyperbola {xy=1}?
Even worse, what if it is all casted on a parabola {xy=1,z=x^2+y^2}?
How would you like a shape like {xy=z} (this looks like a big cross which morphs to hyperbola) to be reported by my library?

Currently I simply give up if I can not reduce equation set to a point, line, plane or whole space.
Please note, that there are non-linear equations which reduce to a single point (for example {x^2+(y-2)^2+z^2=0}),
or several points (for example an intersection {y^2=x, y=x^2}) but these situations are currently not detected as they do not reduce to a set of linear equations.
I really hope to cover more cases in future, though!

# Usage
Here is an example from tests/q3_test.js
```
it("should solve x^2-xy+z^2=0,y=2,zy+z+y^2=7", function(){
  var solver = new Q3.EquationsSolver();
  var solution=solver.solveNonlinear([{'z^2':1,'x^2':1,'xy':-1},{'y':1,'=':2},{zy:1,z:1,'y^2':1,'=':7}]);
  expect(solution).to.deep.equal([{'type':'point', assignment:{x:1,y:2,z:1}}]);
});
```
The result is always an array, which is empty if there is no solution.
Each solution has a `"type"` field which can be either `"point"`,`"line"`,`"plane"` or `"space"`.
The field `"assignment"` for each variable either contains a field named like that variable or not.
If the field exists it can be a `number` (for example `2`) or an `object` (for example `{"x":2,"1":5}`).
If the field is not present, it means that the variable can have any real value.

The solveNonlinear function accepts two arguments.
The first is the `equationSet`, the second is optional list of variable names (must be single characters!) and defaults to `["x","y","z"]`. If you are interested in 2-D problems only remember to pass `["x","y"]` as the second argument.

The `equationSet` is simply an array of equations, and each equation is a hashmap representation of a terms.
The value in this hashmap is the numeric multiplier and the key can be one of following:
* variable name, for example `"x"`
* squared variable name, for example `"x^2"`
* a product of two variables, for example `"xz"`
* the `"="` sign, which means that the number is the value of the sum of all other terms
* alternatively you can use `"1"` as the key, which works just like `"="` but with the sign of the number flipped.
