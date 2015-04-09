var phantom = require('phantom');
var _ = require('underscore');
var assert = require('assert');
var system = require('system');


//var originBaseURL = 'http://localhost:9000';
//var validationBaseURL = 'http://localhost:9000';


var args = process.argv;
var originBaseURL = args[2] || process.stderr.write('Usage: node ramparts.js <origin_url> <validation_url> <page>\n') && process.exit();
var validationBaseURL = args[3] || process.stderr.write('Usage: node ramparts.js <origin_url> <validation_url> <page>\n') && process.exit();
var route = args[4] || process.stderr.write('Usage: node ramparts.js <page>\n') && process.exit();


console.log('\n\nRunning', originBaseURL, validationBaseURL, route);


/**
 * Returns basic information about the page
 */
function discovery() {

  console.log('Performing data discovery');

  // Toggle collapsed elements so they can be scraped
  var hidden = document.querySelectorAll('.icon-caret-left');
  for (var i=0; i < hidden.length; i++) { 
    $(hidden[i]).click();
  }



  // Toggle and expose all facet terms to DOM
  // Open facets, and expand all terms
  var activeTerms = [];
  var inactiveTerms = [];

  var facets = $('ul.t_facets__facet');

  for (var i=0; i < facets.length; i++) {
    var facetName = $(facets[i]).find('.t_facets__facet__title__label')[0].textContent.trim();
    var toggle = $(facets[i]).find('.t_facets__facet__title__label i');


    if (toggle.hasClass('icon-caret-right')) {
      toggle.click();
    }

    var hasMore = $(facets[i]).find('.t_sh__toggle i');
    if (hasMore.hasClass('icon-caret-down')) {
      hasMore.click();
    }

    var actives = $(facets[i]).find('.t_facets__facet__terms__active__term__count').not('.t_facets__facet__term__na');
    var activeLabels = $(facets[i]).find('.t_facets__facet__terms__active__term__label__text');

    var inactives = $(facets[i]).find('.t_facets__facet__terms__inactive__term__count').not('.t_facets__facet__term__na'); 
    var inactiveLabels = $(facets[i]).find('.t_facets__facet__terms__inactive__term__label');

    if (activeLabels.length > 0) {
      for (var i2=0; i2 < activeLabels.length; i2++) {
        var label = activeLabels[i2].textContent.trim();
        var count = '-'; 
        
        if (actives[i2]) {
          count = actives[i2].textContent.trim();
          count = count.replace(/\s+/, '').replace(/,/g, '');
        }


        activeTerms.push({
          facet: facetName,
          term: label,
          count: count
        });
      }
    }
    
    
    if (inactiveLabels.length > 0) {
      for (var i3=0; i3 < inactiveLabels.length; i3++) {
        var label = inactiveLabels[i3].textContent.trim();
        var count = '';
        
        if (inactives[i3]) {
          count = inactives[i3].textContent.trim();
          count = count.replace(/\s+/, '').replace(/,/g, '');
        }

        inactiveTerms.push({
          facet: facetName,
          term: label,
          count: count
        });
      }
    }
  }

  // Gather links
  var links = document.getElementsByTagName('a');
  links = Array.prototype.map.call(links,function(link){
    return {
      href: link.getAttribute('href'),
      value: link.text
    }
  });


  return {
     activeTerms: activeTerms,
     inactiveTerms: inactiveTerms,
     links: links
  };
}



function validateFacets(route, activeTerms, inactiveTerms) {
  phantom.create(function(ph) {
    ph.createPage(function(page) {

      function validate(result) {
        //console.log('active terms', activeTerms.length, result.activeTerms.length);
        //console.log('inactive terms', inactiveTerms.length, result.inactiveTerms.length);

        activeTerms.forEach(function(term) {
          var match = _.find(result.activeTerms, function(t) { return t.facet === term.facet && t.term === term.term; });
          console.log('Facet', term.facet, term.term, term.count, match.count, '\t\t', match.count === term.count? 'OK' : 'ERROR');
        });

        inactiveTerms.forEach(function(term) {
          var match = _.find(result.inactiveTerms, function(t) { return t.facet === term.facet && t.term === term.term; });
          console.log('Facet', term.facet, term.term, term.count, match.count, '\t\t', match.count === term.count? 'OK' : 'ERROR');
        });
        ph.exit();
      }

      page.open(validationBaseURL + route, function(status) {
        setTimeout(function() {
          page.evaluate(discovery, validate);
        }, 3000);
      });
    })
  });
}



function validateLink(href, value) {

  // Normalize
  value = value.replace(/,/g, '');
  value = parseInt(value, 10);
  if (href.charAt(0) !== '/') href = '/' + href;
  if (isNaN(value)) return;

  phantom.create(function(ph) {

    function evaluate(selector) {
      var res = null;
      res = document.querySelectorAll(selector)[0].textContent;
      res = res.replace(/\n/, '').replace(/\s+/, '').replace(/,/g, '');
      res = parseInt(res, 10);
      return res;
    }
  
    function validate(result) {
      console.log(href, value, result, '\t\t', value===result? 'OK':'ERROR');
      ph.exit();
    }

    // FIXME: Should use IDs instead of classes/tags
    var selector = '';
    if (href.indexOf('/search') >= 0) {
      selector = '.t_tabs__tab__donor small';
      if (href.indexOf('/search/m') >= 0)  {
        selector = '.t_tabs__tab__mutation small';
      } else if (href.indexOf('/search/g') >= 0) {
        selector = '.t_tabs__tab__gene small';
      }
    } else if (href.indexOf('/projects/details') >= 0) {
      selector = ".t_table_top strong";
    } else if (href.indexOf('/projects/history') >= 0) {
      selector = ".t_table_top strong";
    } else if (href.indexOf('/projects/summary') >= 0) {
      selector = ".t_table_top strong";
    } else if (href.indexOf('/projects') >= 0) {
      selector = ".t_table_top strong";
      href = href.replace('/projects', '/projects/details');
    }

    ph.createPage(function(page) {
      page.open(validationBaseURL + href, function(status) {
        setTimeout(function() {
          page.evaluate(evaluate, validate, selector);
        }, 3000);
      });
    })

  });
}



phantom.create(function(ph) {

  function validate(result) {
    var links = _.filter(result.links, function(d) {
      var value = d.value;
      value = value.replace(/,/g, '');
      value = parseInt(value, 10);

      return d.href !== '' && isNaN(value) === false;
    });

    console.log('Validating against', validationBaseURL + route);
    
    // Dispatch facet validation
    validateFacets(route, result.activeTerms, result.inactiveTerms);

    // Dispatch link validation
    var batchCounter = 0;
    var batchSize = 5;

    while(true) {
      (function(batchCounter) {
        setTimeout(function() {
          for (var ii = (batchCounter * batchSize); ii < ((batchCounter+1) * batchSize); ii++) {
            if (ii < links.length) {
              //console.log('checking   ', links[ii].href);
              validateLink(links[ii].href, links[ii].value);
            }
          }
        }, batchCounter * 5000);
      })(batchCounter);

      if (batchCounter * batchSize >= links.length) {
        break;
      }
      batchCounter ++;
    }

    ph.exit();
  }



  return ph.createPage(function(page) {
    page.set('onConsoleMessage', function(msg) {
      console.log('-- ' + msg);
    });

    page.set('onError', function(msg, trace) {
      console.log('page error', msg);
    });

    _page = page;

    return page.open(originBaseURL + route, function(status) {
      console.log('waiting to process', originBaseURL + route);
      setTimeout(function() {
        console.log('evaluating...');
        page.evaluate(discovery, validate); 
      }, 4000);

    });
  });
});
