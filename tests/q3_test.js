var expect = chai.expect;

describe("EquationsSolver",function(){
  describe("solveNonlinear", function(){
    it("should return unrestricted volume solution for empty equations set", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([]);
      expect(solution).to.deep.equal([{'type':'volume', assignment:{}}]);
    });
    it("should return unrestricted volume solution for dummy equations set", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':0},{'=':0}]);
      expect(solution).to.deep.equal([{'type':'volume', assignment:{}}]);
    });
    it("should solve x=3 in 1-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':3,'x':1}],['x']);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:3}}]);
    });
    it("should solve x=3 in 2-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':3,'x':1}],['x','y']);
      expect(solution).to.deep.equal([{'type':'line', assignment:{x:3}}]);
    });
    it("should solve x=3 in 3-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':3,'x':1}]);
      expect(solution).to.deep.equal([{'type':'plane', assignment:{x:3}}]);
    });
    it("should solve x=3,y=2 in 2-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':3,'x':1},{'=':2,'y':1}],['x','y']);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:3,y:2}}]);
    });
    it("should solve x=3,y=2 in 3-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':3,'x':1},{'=':2,'y':1}]);
      expect(solution).to.deep.equal([{'type':'line', assignment:{x:3,y:2}}]);
    });
    it("should solve 2*x=6,5*y=10 in 2-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':6,'x':2},{'=':10,'y':5}],['x','y']);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:3,y:2}}]);
    });
    it("should solve 2*x=6,5*y=10 in 3-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':6,'x':2},{'=':10,'y':5}]);
      expect(solution).to.deep.equal([{'type':'line', assignment:{x:3,y:2}}]);
    });
    it("should solve 2*x+y=8,5*y-x=7 in 2-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':8,'x':2,'y':1},{'=':7,'y':5,'x':-1}],['x','y']);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:3,y:2}}]);
    });
    it("should solve 2*x+y=8,5*y-x=7 in 3-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':8,'x':2,'y':1},{'=':7,'y':5,'x':-1}]);
      expect(solution).to.deep.equal([{'type':'line', assignment:{x:3,y:2}}]);
    });
    it("should solve 2*x+y=8,5*y-x=7,x+y=5 in 2-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':8,'x':2,'y':1},{'=':7,'y':5,'x':-1},{'=':5,'x':1,'y':1}],['x','y']);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:3,y:2}}]);
    });
    it("should solve 2*x+y=8,5*y-x=7,x+y=5 in 3-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':8,'x':2,'y':1},{'=':7,'y':5,'x':-1},{'=':5,'x':1,'y':1}]);
      expect(solution).to.deep.equal([{'type':'line', assignment:{x:3,y:2}}]);
    });
    it("should solve x+y+z=2,x+2*y+3*z=-2,x+4*y+5*z=-4 in 3-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{x:1,y:1,z:1,'=':2},{x:1,y:2,z:3,'=':-2},{x:1,y:4,z:5,'=':-4}]);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:3,y:2,z:-3}}]);
    });
    it("should solve x+y=5,y+z=-1,x+z=0 in 3-D", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{x:1,y:1,'=':5},{y:1,z:1,'=':-1},{x:1,z:1,'=':0}]);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:3,y:2,z:-3}}]);
    });
    it("should solve x^2=9", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':9,'x^2':1}],['x']);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:3}},{'type':'point', assignment:{x:-3}}]);
    });
    it("should solve x^2=-9", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':-9,'x^2':1}],['x']);
      expect(solution).to.deep.equal([]);
    });
    it("should solve (x-3)^2=0", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':-9,'x^2':1,'x':-6}],['x']);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:3}}]);
    });
    it("should solve (x+3)^2=0", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':-9,'x^2':1,'x':6}],['x']);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:-3}}]);
    });
    it("should solve x^2-2x+1=0", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':-1,'x^2':1,'x':-2}],['x']);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:1}}]);
    });
    it("should solve x^2-xy+1=0,y=2", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'=':-1,'x^2':1,'xy':-1},{'y':1,'=':2}],['x','y']);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:1,y:2}}]);
    });
    it("should solve x^2-xy+z^2=0,y=2,zy+z+y^2=7", function(){
      var solution=(new Q3.EquationsSolver()).solveNonlinear([{'z^2':1,'x^2':1,'xy':-1},{'y':1,'=':2},{zy:1,z:1,'y^2':1,'=':7}]);
      expect(solution).to.deep.equal([{'type':'point', assignment:{x:1,y:2,z:1}}]);
    });
  })
})
