var phantom = require('phantom');
var _ = require('underscore');
var system = require('system');

var BASE_URL = 'https://dcc.icgc.org';
// var BASE_URL = 'http://localhost:8080';


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
    
    links.forEach(function(link, idx) {
      setTimeout(function() {
        traceLink(_page, link.href, link.value);
      }, 3000 * idx);
    });

    ph.exit();
  }

  function evaluate() {


    var hidden = document.querySelectorAll('.icon-caret-left');
    // console.log('hello ' +  hidden.length);
    // for (var i=0; i < hidden.length; i++) { 
    // for (var i=0; i < hidden.length; i++) { 
    for (var i=0; i < 2; i++) { 
      $(hidden[i]).click();
      //console.log('hello ' +  hidden[i]);
      //if (hidden[i]) hidden[i].click();
    }
    

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
    /*
    page.onConsoleMessage = function(msg) {
      system.stderr.writeLine('console :' +  msg);
    };
    */

    return page.open(BASE_URL + '/search/g', function(status) {
      // console.log("opened icgc? ", status );

      console.log('waiting...');
      setTimeout(function() {
        console.log('evaluating...');
        page.evaluate(evaluate, validate);
      }, 3500);

    });
  });
});
