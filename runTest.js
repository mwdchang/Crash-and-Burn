// Ignore bad certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var request = require("request");
var assert = require("assert");
var underscore = require("underscore");
var params = require("./params");

// var url = "https://dcc.icgc.org/api/v1";
var url = "https://localhost:55555/api/v1";
var eventCount = 5;

params.donors = [];
params.mutations = [];


// Donors and mutations are more dynamic, can't really set them statically
var ready = 2;
(function seedDonors() {
   var path = '/donors?field=id&size=10';
   request(url + path, function(err, response, body) {
      var body = JSON.parse(body);
      params.donors = underscore.pluck( body.hits, 'id');
      ready --;
      if (ready <= 0) executeTest();
   });
})();
(function seedMutations() {
   var path = '/mutations?field=id&size=10';
   request(url + path, function(err, response, body) {
      var body = JSON.parse(body);
      params.mutations = underscore.pluck( body.hits, 'id');
      ready --;
      if (ready <= 0) executeTest();
   });
})();



function executeTest() {
   test_project_mutation_count_random();
   test_project_gene_count_random();
   test_project_gene_mutation_count_random();
   test_project_gene_donor_count_random();
   test_project_donor_gene_count_random();
}



function _project_gene_count(proj) {
   if (! Array.isArray(proj)) proj = [proj];

   request(url + "/projects/" + proj.join(',') +  "/genes/counts", function(err, response, body) {
      var data = JSON.parse(body);
      var filter = {donor:{projectId:{is: proj }}};
      var u = "/genes?filters=" + JSON.stringify(filter) + "&size=0";
      request(url + u, function(err, response, body) {
         body = JSON.parse(body);
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

function _project_donor_count(proj) {
   if (! Array.isArray(proj)) proj = [proj];

   request(url + '/projects/' + proj.join(',') +  '/donors/counts', function(err, response, body) {
      var data = JSON.parse(body);
      var filter = {donor:{projectId:{is: proj }}};
      var u = '/donors?filters=' + JSON.stringify(filter) + '&size=0';
      request(url + u, function(err, response, body) {
         body = JSON.parse(body);
         a2 = body.pagination.total;
         a1 = data.Total;

         console.log('Project-Donor', proj, 'Expecting:', a1, 'Actual:', a2);
         assert.equal(a1, a2);
      });
   });
}


function _project_donor_gene_count(proj, donor) {
   if (! Array.isArray(proj)) proj = [ proj ];
   if (! Array.isArray(donor)) donor = [ donor ];

   var path = '/projects/' + proj.join(',') + '/donors/' + donor.join(',') + '/genes/counts';
   request(url + path, function(err, response, body) {
     console.log('path ', path, err);
     var data = JSON.parse(body);

      proj.forEach(function(p) {
         var filter = {
            donor:{
               projectId:{is: p},
               id:{is: donor}
            },
         };
         var genePath = '/genes?filters=' + JSON.stringify(filter) + '&size=0';
         request(url + genePath, function(err, response, body) {
            body = JSON.parse(body);

            var expected = data[p].Total;
            var actual = body.pagination.total;
            console.log('Project-Donor-Gene', p, donor.join(','), 'Expecting:', expected, 'Actual:', actual);
            assert.equal(expected, actual);
         });
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
            a2 = body.pagination.total;
            a1 = data[p].Total;
            console.log("Project-Gene-Mutation", p, gene.join(','), "Expecting:", a1, "Actual:", a2);
            assert.equal(a1, a2);
         });
      });
   });
}


function _project_gene_donor_count(proj, gene) {
   if (! Array.isArray(proj)) proj = [proj];
   if (! Array.isArray(gene)) gene = [gene];

   var path = proj.join(',') + "/genes/" + gene.join(',') + "/donors/counts";
   request(url + "/projects/" + path , function(err, response, body) {
      console.log("path ", "/projects/"+path);
      var data = JSON.parse(body);

      proj.forEach(function(p) {
         var filter = {
            donor:{projectId:{is: p}},
            gene:{id:{is: gene}}
         };
         var u = "/donors?filters=" + JSON.stringify(filter) + "&size=0";
         request(url + u, function(err, response, body) {
            body = JSON.parse(body);
            a2 = body.pagination.total;
            a1 = data[p].Total;
            console.log("Project-Gene-Donor", p, gene.join(','), "Expecting:", a1, "Actual:", a2);
            assert.equal(a1, a2);
         });
      });
   });
}


function random(list) {
   return underscore.sample(list, Math.floor(Math.random() * list.length) + 1); 
}

function test_project_gene_mutation_count_random() {
   for (var i=0; i < eventCount; i++) {
      _project_gene_mutation_count(random(params.projects), random(params.genes));
   }
}

function test_project_gene_donor_count_random() {
   for (var i=0; i < eventCount; i++) {
      _project_gene_donor_count(random(params.projects), random(params.genes));
   }
}

function test_project_gene_count_random() {
   for (var i=0; i < eventCount; i++) {
      _project_gene_count( random(params.projects) );
   }
}

function test_project_mutation_count_random() {
   for (var i=0; i < eventCount; i++) {
      _project_mutation_count( random(params.projects) );
   }
}

function test_project_donor_gene_count_random() {
   for (var i=0; i < eventCount; i++) {
      _project_donor_gene_count( random(params.projects), random(params.donors) );
   }
}



