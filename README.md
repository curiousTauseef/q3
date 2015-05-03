# q3

This is a Javascript library written in TypeScript for solving quadratic equations sets which arise from geometric problems.
For example if you try to intersect two circles on a plane, you can describe this situation as
two equations which contain terms like x^2 and y^2, which makes them non-linear.
It also means that there can be multiple solutions.

I've called the library q3 because it involves quadratic equations in 3 dimensions.

In general solving sets of quadratic equations is an NP-hard problem (due to the fact x^2=x lets you force x to be 0 or 1).
We sidestep this difficulty by limiting ourselves to at most 3 variables: x,y and z.

One may ask, what does it even mean to solve such an equation set?
The answer is obvious when equations describe a single point: we can just provide its coordinates, for example `{x:1,y:2}`.
If there are multiple points as in {x^2=9, y=3}, then we can just return a list of them, for example `[{x:3,y:3},{x:-3,y:3}]`.
If it is a line, or plane, we need some convention. 
I've decided to represent linear expressions such as "3y+5" as hashaps - in this case: `{"y":3,"1":5}`.
This alows me to describe a line "x=3y+5, z=2y+3" as `{"x":{"y":3,"1":5},"z":{"y":2,"1":3}}`.

But what if the result is an eliptic curve {x^2+2y^2=7}, or a hyperbola {xy=1}?
Even worse, what if it is all casted on a paraboloida {xy=1,z=x^2+y^2}?
How would you like a shape like {xy=z} (this looks like a big cross which morphs to hyperbola) to be reported by my library?
There are even more complicated algebraic sets, like the one you get when [intersecting two tubes] (http://www.wolframalpha.com/input/?i=x%5E2%2Bz%5E2%2By%2Bz%3D1%2C+y%5E2%2Bz%5E2%2Bx-z%3D1).

Currently, I simply give up if I can not reduce equation set to a point, line, plane or whole space.
Please note, that there are non-linear equations which reduce to a single point (for example {x^2+(y-2)^2+z^2=0}),
or several points (for example an intersection {y^2=x, y=x^2}) but these situations are currently not detected as they do not reduce to a set of linear equations.
I really hope to cover more cases in future, though!

# Usage
You need the q3.js file. I've commited a compiled version to this repo for your convinience, which should work with both Node.js and browser (in the later case, you need to include lodash.js yourself). Alternatively you can compile equations_solver.ts with type script compiler yourself. You can also find the equations_solver.d.ts definition file helpful if you plan to use precompiled version in a TypeScript project.

Here is an example from test/test.js
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

# The algorithm

The algoritm tries to find a variable it can eliminate.
It's quite easy to do if there is a linear equation in the equation set.
But my algorithm is smart enough to reduce similar non-linear equations to extract a linear equation from them - for example for example {x^2+y^2+y=7, x^2+y^2-x=12} can be used to deduce a new linear equation x+y=-5, and then eliminate one of these two variables.
This is a very common situation when you interset multiple circles or spheres, as their equations are very similar to each other.
The algorithm can also notice that a non-linear equation involves only a single variable, and thus can be easily solved by computing `delta=b^2-4ac` as in high-school.

# What it currently can not do:
* it is not smart enough to group non-negative terms and deduce anything from such grouping. For example if I see x^2+y^2-2xy=0, then I know I can group it to (x-y)^2=0, and deduce that x-y=0. My algorithm can not do that yet:(
* it does not know what to do if there are any nonlinear equations left after elimination process stops. There are some TODO cases for which I know what to do, but have not implemented them yet (such as intersecting two or more conic curves, which is relatively simple). But there are cases where I have no idea what I'd like to do (that is: I see no elegant way of describing solution, other than returning the reduced equation set itself)
