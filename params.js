// d3.select("#projects").selectAll("tr").each(function() { d3.select(this).selectAll("td").each(function(d, i){ if (i==0) { console.log(d3.select(this).text()); }}); })

var _projects = [
   "BRCA-US"
,  "GBM-US"
,  "OV-US"
,  "NBL-US"
,  "KIRC-US"
,  "THCA-US"
,  "UCEC-US"
,  "PACA-AU"
,  "LUAD-US"
,  "COAD-US"
,  "ALL-US"
,  "LUSC-US"
,  "HNSC-US"
,  "PBCA-DE"
,  "SKCM-US"
,  "STAD-US"
,  "LGG-US"
,  "CLLE-ES"
,  "LINC-JP"
,  "LIRI-JP"
,  "LAML-US"
,  "PRAD-US"
,  "BLCA-US"
,  "READ-US"
,  "KIRP-US"
,  "LIHC-US"
,  "LICA-FR"
,  "PACA-CA"
,  "BRCA-UK"
,  "CMDI-UK"
,  "CESC-US"
,  "RECA-EU"
,  "LUSC-KR"
,  "BLCA-CN"
,  "LAML-KR"
,  "OV-AU"
,  "ESCA-CN"
,  "PAAD-US"
,  "BOCA-UK"
,  "MALY-DE"
,  "ORCA-IN"
,  "PAEN-AU"
,  "EOPC-DE"
,  "ESAD-UK"
,  "THCA-SA"
,  "PRAD-CA"
,  "RECA-CN"
,  "GACA-CN"
,  "PRAD-UK"];


var _genes = [
   "ENSG00000155657"
,  "ENSG00000141510"
,  "ENSG00000204956"
,  "ENSG00000204970"
,  "ENSG00000204969"
]; 


var _mutations = [
];



exports.projects  = _projects;
exports.genes     = _genes;
exports.mutations = _mutations;