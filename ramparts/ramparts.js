var phantom = require('phantom');
var _ = require('underscore');

// var BASE_URL = 'https://dcc.icgc.org/search';
var BASE_URL = 'http://localhost:8080';


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
    if (href.indexOf('/m?') >= 0)  {
      selector = '.t_tabs__tab__mutation small';
    } else if (href.indexOf('/g?') >= 0) {
      selector = '.t_tabs__tab__gene small';
    }

    ph.createPage(function(page) {
      page.open(BASE_URL + href, function(status) {
        setTimeout(function() {
          page.evaluate(evaluate, validate, selector);
        }, 4000);
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
    
    // console.log('Html', links);

    links.forEach(function(link) {
      traceLink(_page, link.href, link.value);
    });

    ph.exit();
  }

  function evaluate() {
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

    return page.open(BASE_URL + '/search', function(status) {
      console.log("opened icgc? ", status );

      console.log('waiting...');
      setTimeout(function() {
        console.log('evaluating...');
        page.evaluate(evaluate, validate);
      }, 4000);

    });
  });
});
