const _ = require('lodash')
const path = require('path')
const slash = require(`slash`)

const queryWordPressGatsbyConfig = `
  {
    wordpressGatsbyConfig {
      per_page
      front_page
      posts_page
    }
  }
`

// step 1. add graphql query for wp pages here

const queryWordPressPages = `
  {
    allWordpressPage (filter: { status: { eq : "publish" } }) {
      edges {
        node {
          id
          wordpress_id
          slug
          template
        }
      }
    }
  }
`

exports.createPages = ({ graphql, boundActionCreators }) => {
  let config
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    graphql(queryWordPressGatsbyConfig)
      .then(r => {
        if (r.errors) {
          console.log(r.errors)
          reject(r.errors)
        }
        return r.data.wordpressGatsbyConfig
      })

      .then(config => {
        // step 2. query for wordpress pages, and then loop over them
        // when adding step 4, please remove the resolve(); function below.

        return graphql(queryWordPressPages)
          .then(r => {
            if (r.errors) {
              console.log(r.errors)
              reject(r.errors)
            }
            _.each(r.data.allWordpressPage.edges, edge => {
              // step 3. add the createPage function here
              createPage({
                path:
                  edge.node.wordpress_id === config.front_page
                    ? '/'
                    : edge.node.slug,
                component: slash(path.resolve(`./src/templates/page.js`)),
                context: {
                  id: edge.node.id,
                  wordpress_id: edge.node.wordpress_id,
                },
              })
            })
          })
          .then(r => {
            resolve()
          })

        resolve()
      })
  })
}
