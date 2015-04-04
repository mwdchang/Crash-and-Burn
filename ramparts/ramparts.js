var phantom = require('phantom');

phantom.create(function(ph) {
  return ph.createPage(function(page) {
    return page.open("https://dcc.icgc.org", function(status) {
      console.log("opened icgc? ", status);
      return page.evaluate((function() {
        return document;
      }), function(result) {
        console.log('Page title is ' + result);

        console.log('Html', result.all[0].outerHTML);
        //Object.keys(result).forEach(function(key) {
          // console.log('key', key, result[key]);
        //});

        return ph.exit();
      });
    });
  });
});
