ramparts
===
Cross-server regression tester with phantomJS. Given a URL, ramparts executes against an origin server and scrapes the page content for API invocations. 
It then executes the API against another server and validates the results against what is been shown on the orign server.

Note ramparts currently has no support for regression testing facet terms.


Steps
---

- Install node modules
  ```
  npm install
  ```

- Run
  ```
  node ramparts.js <origin_base_url> <validation_base_url> <page>

  ```

- Examples
  ```
  # Check genes
  node ramparts.js http://localhost:8888 http://localhost:9999 /search/g

  # Check donor with filter
  node ramparts.js http://localhost:9000 http://localhost:9000 /search\?filters=%7B%22donor%22:%7B%22id%22:%7B%22is%22:%5B%22DO1%22%5D%7D%7D%7D
  ```

