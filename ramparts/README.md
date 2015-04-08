ramparts
===
Cross-server regression tester with phantomJS. Given a URL, ramparts executes against an origin server and scrapes the page content for API invocations. 
It then executes the API against another server and validates the results against what is been shown on the orign server.

Note: facet testing support is largely experimental, as it is largely reliant on class-based selectors. It does not actually simulate facet term clicking, but
rather that resultant page has the same facet terms and facet term counts.

Note: ramparts.js creates additional processes to sandbox actions. You will need a decent machine !! 


Steps
---

- Install node modules
  ```
  npm install
  ```

- Run
  ```
  # Set up path to phantomJS binary
  export PATH=$PATH:node_modules/phantomjs/bin

  # Execute test
  node ramparts.js <origin_base_url> <validation_base_url> <page>
  ```

- Examples
  ```
  # Check genes, check localhost:8888 against localhost:9999
  node ramparts.js http://localhost:8888 http://localhost:9999 /search/g

  # Check donor with filter, consistency on localhost:9000
  node ramparts.js http://localhost:9000 http://localhost:9000 /search\?filters=%7B%22donor%22:%7B%22id%22:%7B%22is%22:%5B%22DO1%22%5D%7D%7D%7D
  ```

