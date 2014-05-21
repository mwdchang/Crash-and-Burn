var request = require("request");
var assert = require("assert");
var underscore = require("underscore");
var params = require("./params");

var url = "https://dcc.icgc.org/api/v1";
var eventCount = 3;

function test_project_gene_count() {
   var a1;
   var a2;

   params.projects.forEach(function(proj) {
      request(url + "/projects/" + proj +  "/genes/count", function(err, response, body) {
         var data = JSON.parse(body);
         var filter = {donor:{projectId:{is: [proj] }}};
         var u = "/genes?filters=" + JSON.stringify(filter) + "&size=0";
         request(url + u, function(err, response, body) {
            body = JSON.parse(body);
            assert.ok(body.pagination);
            assert.ok(body.pagination.total);
            a2 = body.pagination.total;
            a1 = data.Total;

            console.log("Testing ", proj, a1, a2);
            assert.equal(a1, a2);
         });
      });
   });
}

function test_project_gene_count2() {
   var a1;
   var a2;

   for (var i=0; i < eventCount; i++) {
      var sampleSize = Math.floor(Math.random() * params.projects.length) + 1;
      var proj = underscore.sample( params.projects, sampleSize);

      request(url + "/projects/" + proj.join(',') +  "/genes/count", function(err, response, body) {
         var data = JSON.parse(body);
         var filter = {donor:{projectId:{is: proj }}};
         var u = "/genes?filters=" + JSON.stringify(filter) + "&size=0";
         request(url + u, function(err, response, body) {
            body = JSON.parse(body);
            assert.ok(body.pagination);
            assert.ok(body.pagination.total);
            a2 = body.pagination.total;
            a1 = data.Total;

            console.log("Testing ", proj, a1, a2);
            assert.equal(a1, a2);
         });
      });
   }
}


test_project_gene_count2();
