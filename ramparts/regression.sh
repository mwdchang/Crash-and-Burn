#!/bin/bash

################################################################################
# Replace with servers you want to test
#  S1 - Ground truth server
#  S2 - Server to be tested
#
################################################################################
S1="http://localhost:9000"
S2="http://localhost:9000"

export PATH=$PATH:node_modules/phantomjs/bin

# Home Page
node ./ramparts.js $S1 $S2 /


# Projects Page
node ./ramparts.js $S1 $S2 /projects
node ./ramparts.js $S1 $S2 /projects/details


# Search - Donor
node ./ramparts.js $S1 $S2 "/search?filters={\"donor\":{\"id\":{\"is\":[\"DO45299\"]}}}"
node ./ramparts.js $S1 $S2 "/search"


# Search 
node ./ramparts.js $S1 $S2 /search
node ./ramparts.js $S1 $S2 /search/g
node ./ramparts.js $S1 $S2 /search/m
node ./ramparts.js $S1 $S2 /search/m/o


# Donor Entity
node ./ramparts.js $S1 $S2 /donors/DO45299 
node ./ramparts.js $S1 $S2 "/donors/DO51516?filters={\"mutation\":{\"functionalImpact\":{\"is\":[\"High\"]}}}"


# Gene Entity
node ./ramparts.js $S1 $S2 /genes/ENSG00000141510



# Mutation Entity
node ./ramparts.js $S1 $S2 /mutations/MU5136

# Project Entity
node ./ramparts.js $S1 $S2 /projects/BRCA-US


# Gene Set Entity
node ./ramparts.js $S1 $S2 /genesets/GS1
node ./ramparts.js $S1 $S2 "/genesets/GO:0006865"
node ./ramparts.js $S1 $s2 /genesets/REACT_1396


# Empyrean
pgrep -f phantom | xargs kill

