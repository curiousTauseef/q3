var expect = chai.expect;

describe("EquationsSolver",function(){
  describe("solveNonlinear", function(){
    it("should return empty solution for empty equations set", function(){
      var solution=(new EquationsSolver()).solveNonlinear([],[]);
      expect(solution).to.deep.equal({});
    });
    it("should return empty solution for dummy equations set", function(){
      var solution=(new EquationsSolver()).solveNonlinear([],[{'=':0},{'=':0}]);
      expect(solution).to.deep.equal({});
    });
    it("should solve x=3", function(){
      var solution=(new EquationsSolver()).solveNonlinear(['x'],[{'=':3,'x':1}]);
      expect(solution).to.deep.equal({x:3});
    });
    it("should solve x=3,y=2", function(){
      var solution=(new EquationsSolver()).solveNonlinear(['x','y'],[{'=':3,'x':1},{'=':2,'y':1}]);
      expect(solution).to.deep.equal({x:3,y:2});
    });
    it("should solve 2*x=6,5*y=10", function(){
      var solution=(new EquationsSolver()).solveNonlinear(['x','y'],[{'=':6,'x':2},{'=':10,'y':5}]);
      expect(solution).to.deep.equal({x:3,y:2});
    });
    it("should solve 2*x+y=8,5*y-x=7", function(){
      var solution=(new EquationsSolver()).solveNonlinear(['x','y'],[{'=':8,'x':2,'y':1},{'=':7,'y':5,'x':-1}]);
      expect(solution).to.include.keys('x','y');
      expect(solution.x).to.be.closeTo(3,1e-9);
      expect(solution.y).to.be.closeTo(2,1e-9);
    });
    it("should solve 2*x+y=8,5*y-x=7,x+y=5", function(){
      var solution=(new EquationsSolver()).solveNonlinear(['x','y'],[{'=':8,'x':2,'y':1},{'=':7,'y':5,'x':-1},{'=':5,'x':1,'y':1}]);
      expect(solution).to.include.keys('x','y');
      expect(solution.x).to.be.closeTo(3,1e-6);
      expect(solution.y).to.be.closeTo(2,1e-6);
    });
    it("should solve x^2=9", function(){
      var solution=(new EquationsSolver()).solveNonlinear(['x'],[{'=':9,'x^2':1}]);
      expect(solution).to.deep.equal({x:3});
    });
    it("should solve (x-3)^2=0", function(){
      var solution=(new EquationsSolver()).solveNonlinear(['x'],[{'=':-9,'x^2':1,'x':-6}]);
      expect(solution.x).to.be.closeTo(3,1e-6);
    });
    it("should solve (x+3)^2=0", function(){
      var solution=(new EquationsSolver()).solveNonlinear(['x'],[{'=':-9,'x^2':1,'x':6}]);
      expect(solution.x).to.be.closeTo(-3,1e-6);
    });
    it("should solve x^2-2x+1=0", function(){
      var solution=(new EquationsSolver()).solveNonlinear(['x'],[{'=':-1,'x^2':1,'x':-2}]);
      expect(solution.x).to.be.closeTo(1,1e-6);
    });
  })
})
