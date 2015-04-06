var phantom = require('phantom');
var _ = require('underscore');
var system = require('system');


// Expected
var BASE_URL = 'https://dcc.icgc.org';

// Actual
// var VALIDATION_BASE_URL = "http://10.5.74.100:8080";

var VALIDATION_BASE_URL = 'https://dcc.icgc.org';


var args = process.argv;
var route = args[2] || process.stderr.write('Usage: node ramparts.js <page>\n') && process.exit();



function traceLink(page, href, value) {


  // Normalize
  value = value.replace(/,/, '');
  value = parseInt(value, 10);
  if (href.charAt(0) !== '/') href = '/' + href;
  if (isNaN(value)) return;


  phantom.create(function(ph) {

    function evaluate(selector) {
      var res = null;
      res = document.querySelectorAll(selector)[0].textContent;
      res = res.replace(/\n/, '').replace(/\s+/, '').replace(/,/, '');
      res = parseInt(res, 10);
      return res;
    }
  
    function validate(result) {
      console.log(href, value, result);
      ph.exit();
    }

    var selector = '.t_tabs__tab__donor small';

    if (href.indexOf('/search') >= 0) {
      if (href.indexOf('/m?') >= 0)  {
        selector = '.t_tabs__tab__mutation small';
      } else if (href.indexOf('/g?') >= 0) {
        selector = '.t_tabs__tab__gene small';
      }
    } else if (href.indexOf('/projects') >= 0) {
      href = href.replace('/projects', '/projects/details');
      selector = ".t_table_top strong";
console.log(href, selector, '!!!!!');
    }

    ph.createPage(function(page) {
      page.open(VALIDATION_BASE_URL + href, function(status) {
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
    
    console.log('Validating against', VALIDATION_BASE_URL + route);

    // Dispatch batch traces
    var batchCounter = 0;
    for (var idx=0; idx < links.length; idx++) {
      if (idx % 5 === 0) {

        (function(batchCounter, i) {
          setTimeout(function() {
            traceLink(_page, links[i].href,   links[i].value);
            if (i === 0) return;
            traceLink(_page, links[i-1].href, links[i-1].value);
            traceLink(_page, links[i-2].href, links[i-2].value);
            traceLink(_page, links[i-3].href, links[i-3].value);
            traceLink(_page, links[i-4].href, links[i-4].value);
          }, batchCounter*2500);
        })(batchCounter, idx);

        batchCounter ++;
      }
    }


    /*
    links.forEach(function(link, idx) {
      setTimeout(function() {
        traceLink(_page, link.href, link.value);
      }, 3000 * idx);
    });
    */

    ph.exit();
  }

  function evaluate() {

    // Toggle hidden elements so they can be scraped
    var hidden = document.querySelectorAll('.icon-caret-left');
    for (var i=0; i < hidden.length; i++) { 
      $(hidden[i]).click();
    }
    
    // Gather links
    var links = document.getElementsByTagName('a');
    links = Array.prototype.map.call(links,function(link){
        return {
           href: link.getAttribute('href'),
           value: link.text
        }
     });
     return links;
  }

  return ph.createPage(function(page) {

    _page = page;

    page.set('onConsoleMessage', function(msg) {
      console.log('...' + msg);
    });

    return page.open(BASE_URL + route, function(status) {
      console.log('waiting to process', BASE_URL + route);
      setTimeout(function() {
        console.log('evaluating...');
        page.evaluate(evaluate, validate);
      }, 3500);

    });
  });
});
