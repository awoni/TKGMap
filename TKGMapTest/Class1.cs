using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TKGMap;
using Xunit;

namespace TKGMapTest
{
    public class Class1
    {
        [Theory]
        [InlineData(10000, 10000, 33.09013, 133.60713)]
        [InlineData(98000, 123000, 33.87650, 134.82955)]
        [InlineData(-123000, -111000, 31.88531, 132.32669)]
        public void TestMethod(double x, double y, double lat, double lng)
        {
            double lat0, lng0;
            XyToBl.Calcurate(4, x, y, out lat0, out lng0);
            Assert.True(Math.Abs(lat - lat0) < 0.00001);
            Assert.True(Math.Abs(lng - lng0) < 0.00001);
        }
    }
}
