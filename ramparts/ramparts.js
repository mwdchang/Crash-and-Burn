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
console.error('\n\nRunning', originBaseURL, validationBaseURL, route);


function validateLink(page, href, value) {

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
      if (result !== value) {
        console.log(href, value, result, 'ERROR!!!');
      } else {
        console.log(href, value, result);
      }
      //assert.equal(value, result);
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
  var _page;

  function validate(result) {
    var links = _.filter(result, function(d) {
      return d.href !== '';
    });
    
    console.log('Validating against', validationBaseURL + route);

    // Dispatch batch traces
    var batchCounter = 0;
    for (var idx=0; idx < links.length; idx++) {
      if (idx % 5 === 0) {

        (function(batchCounter, i) {
          setTimeout(function() {
            validateLink(_page, links[i].href,   links[i].value);
            if (i === 0) return;
            validateLink(_page, links[i-1].href, links[i-1].value);
            validateLink(_page, links[i-2].href, links[i-2].value);
            validateLink(_page, links[i-3].href, links[i-3].value);
            validateLink(_page, links[i-4].href, links[i-4].value);
          }, batchCounter*4000);
        })(batchCounter, idx);

        batchCounter ++;
      }
    }
    ph.exit();
  }


  function evaluate() {

    // Toggle collapsed elements so they can be scraped
    var hidden = document.querySelectorAll('.icon-caret-left');
    for (var i=0; i < hidden.length; i++) { 
      $(hidden[i]).click();
    }


    // Toggle and expose all facet terms to DOM
    // Open facets, and expand all terms
    var facets = $('.t_facets__facet');
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

      var actives = $(facets[i]).find('.t_facets__facet__terms__active__term__count');
      var activeLabels = $(facets[i]).find('.t_facets__facet__terms__active__term__label__text');
      var inactives = $(facets[i]).find('.t_facets__facet__terms__inactive__term__count');
      var inactiveLabels = $(facets[i]).find('.t_facets__facet__terms__inactive__term__label');

      console.log('name', facetName, activeLabels.length, inactiveLabels.length);
      
      if (actives.length > 0) {
        for (var i=0; i < actives.length; i++) {
          var label = activeLabels[i].textContent.trim();
          var count = actives[i].textContent.trim();
          console.log('--', label, count);
        }
      }
      
      if (inactives.length > 0) {
        for (var i=0; i < inactives.length; i++) {
          var label = inactiveLabels[i].textContent.trim();
          var count = inactives[i].textContent.trim();
          console.log('--', label, count);
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

    var facets = document.querySelectorAll('.t_facets__facet__terms__inactive__term__count');
    console.log('facet length', facets.length);

    return links;
  }

  return ph.createPage(function(page) {
    page.set('onConsoleMessage', function(msg) {
      console.log('...' + msg);
    });
    _page = page;

    return page.open(originBaseURL + route, function(status) {
      console.log('waiting to process', originBaseURL + route);
      setTimeout(function() {
        console.log('evaluating...');
        page.evaluate(evaluate, validate);
      }, 3500);

    });
  });
});
