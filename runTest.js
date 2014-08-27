// Ignore bad certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var request = require("request");
var assert = require("assert");
var underscore = require("underscore");
var params = require("./params");

// var url = "https://dcc.icgc.org/api/v1";
var url = "https://localhost:55555/api/v1";
var eventCount = 50;

function _project_gene_count(proj) {
   if (! Array.isArray(proj)) proj = [proj];

   request(url + "/projects/" + proj.join(',') +  "/genes/counts", function(err, response, body) {
      var data = JSON.parse(body);
      var filter = {donor:{projectId:{is: proj }}};
      var u = "/genes?filters=" + JSON.stringify(filter) + "&size=0";
      request(url + u, function(err, response, body) {
         body = JSON.parse(body);
         // assert.ok(body.pagination);
         // assert.ok(body.pagination.total);
         a2 = body.pagination.total;
         a1 = data.Total;

         console.log("Project-Gene", proj, "Expecting:", a1, "Actual:", a2);
         assert.equal(a1, a2);
      });
   });
}


function _project_mutation_count(proj) {
   if (! Array.isArray(proj)) proj = [proj];

   request(url + "/projects/" + proj.join(',') +  "/mutations/counts", function(err, response, body) {
      var data = JSON.parse(body);
      var filter = {donor:{projectId:{is: proj }}};
      var u = "/mutations?filters=" + JSON.stringify(filter) + "&size=0";
      request(url + u, function(err, response, body) {
         body = JSON.parse(body);
         a2 = body.pagination.total;
         a1 = data.Total;

         console.log("Project-Mutation", proj, "Expecting:", a1, "Actual:", a2);
         assert.equal(a1, a2);
      });
   });
}

// v1/projects/{projectIds}/genes/{geneIds}/mutations/count
function _project_gene_mutation_count(proj, gene) {
   if (! Array.isArray(proj)) proj = [proj];
   if (! Array.isArray(gene)) gene = [gene];

   var path = proj.join(',') + "/genes/" + gene.join(',') + "/mutations/counts";
   
   request(url + "/projects/" + path , function(err, response, body) {
      console.log("path ", "/projects/"+path);
      var data = JSON.parse(body);

      proj.forEach(function(p) {
         var filter = {
            donor:{projectId:{is: p}},
            gene:{id:{is: gene}}
         };
         var u = "/mutations?filters=" + JSON.stringify(filter) + "&size=0";
         request(url + u, function(err, response, body) {
            body = JSON.parse(body);
            // assert.ok(body.pagination);
            // assert.ok(body.pagination.total);
            a2 = body.pagination.total;
            a1 = data[p].Total;
            console.log("Project-Gene-Mutation", p, gene.join(','), "Expecting:", a1, "Actual:", a2);
            assert.equal(a1, a2);
         });
      });
   });
}


function test_project_gene_mutation_count_specific() {
   _project_gene_mutation_count("BRCA-US", ["ENSG00000204969", "ENSG00000204970"]);
}

function test_project_gene_count_specific() {
   _project_gene_count("BRCA-US");
   _project_gene_count("COAD-US");
}


function test_project_mutation_count_specific() {
   _project_mutation_count("BRCA-US");
   _project_mutation_count("COAD-US");
}


function test_project_gene_mutation_count_random() {
   var a1;
   var a2;
   for (var i=0; i < eventCount; i++) {
      var sampleSize1 = Math.floor(Math.random() * params.projects.length) + 1;
      var proj = underscore.sample( params.projects, sampleSize1);
      var sampleSize2 = Math.floor(Math.random() * params.genes.length) + 1;
      var gene = underscore.sample( params.genes, sampleSize2);
      _project_gene_mutation_count(proj, gene);
   }
}


function test_project_gene_count_random() {
   var a1;
   var a2;
   for (var i=0; i < eventCount; i++) {
      var sampleSize = Math.floor(Math.random() * params.projects.length) + 1;
      var proj = underscore.sample( params.projects, sampleSize);
      _project_gene_count(proj);
   }
}


function test_project_mutation_count_random() {
   var a1;
   var a2;
   for (var i=0; i < eventCount; i++) {
      var sampleSize = Math.floor(Math.random() * params.projects.length) + 1;
      var proj = underscore.sample( params.projects, sampleSize);
      _project_mutation_count(proj);
   }
}


test_project_mutation_count_specific();
test_project_gene_count_specific();
test_project_gene_mutation_count_specific();

test_project_mutation_count_random();
test_project_gene_count_random();
test_project_gene_mutation_count_random();
