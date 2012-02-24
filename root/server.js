/*

Plese rewrite <YOUR DOTCLOUD HOST NAME>, <YOUR DROPBOX APP KEY> and <YOUR DROPBOX APP KEY SECRET> in source.

*/
var express = require( 'express' ),
    dbox    = require( 'dbox' ),
    opts    = require( 'opts' );

opts.parse([
    {
        'short': 'd',
        'long': 'debug',
        'description': 'debug mode',
        'value': false,
        'required': false
    },
]);

/* Mode ( callback url ) */
var callback = "http://<YOUR DOTCLOUD HOST NAME>.dotcloud.com/callback";
if ( opts.get('debug') ) {
    callback = "http://127.0.0.1:8080/callback";
}

/* Express */
var app = express.createServer();
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
    secret: "saginomiya"
  }));
app.use( express.static( __dirname + '/static' ) );

/* Dropbox */
var dropbox = dbox.createClient({
  app_key    : "<YOUR DROPBOX APP KEY>",
  app_secret : "<YOUR DROPBOX APP KEY SECRET>",
  root       : "dropbox"
})

/* OAuth RequestToken */
function getRequestToken( req, res ) {

  dropbox.request_token( function( status, reply ){

//    console.log( status );
//    console.log( reply );

    req.session.requestToken = reply.oauth_token;
    req.session.requestTokenSecret = reply.oauth_token_secret;

    res.redirect('https://www.dropbox.com/1/oauth/authorize?oauth_token=' + reply.oauth_token + "&oauth_callback=" + encodeURIComponent( callback ) );

  });

}

/* OAuth Callback */
app.get('/callback', function(req, res) {
    getAccessToken( req, res );
});

/* OAuth AccessToken */
function getAccessToken(req, res) {

  var options = {
    oauth_token        : req.session.requestToken,
    oauth_token_secret : req.session.requestTokenSecret
  }

  dropbox.access_token( options, function( status, reply ) {

//    console.log(status)
//    console.log(reply)

    req.session.accessToken = reply.oauth_token;
    req.session.accessTokenSecret = reply.oauth_token_secret;

    res.redirect( '/sign.html?oauth_token=' + reply.oauth_token + "&oauth_token_secret=" + reply.oauth_token_secret );

  });

}

/* RESTful Path */

/* auth */
app.get( '/auth', function( req, res ) {
  getRequestToken( req, res );
});

/* list */
app.get( /list(.*)/, function( req, res ) {

  var path = req.params[0];

  var options = {
    oauth_token        : req.query.oauth_token,
    oauth_token_secret : req.query.oauth_token_secret
  }

  dropbox.metadata( path, options, function( status, reply ){

//    console.log( status );
//    console.log( reply );

    res.contentType( 'json' );
    res.send( reply );

  });

});

/* search */
app.get( /search(.*)/, function( req, res ) {

  var path = req.params[0];
  var query = req.query.q;

  var options = {
    oauth_token        : req.query.oauth_token,
    oauth_token_secret : req.query.oauth_token_secret
  }

  dropbox.search( path, query, options, function( status, reply ){

//    console.log( status );
//    console.log( reply );

    res.contentType( 'json' );
    res.send( reply );

  });

});

/* get */
app.get( /get(.*)/, function(req,res) {

  var path =  req.params[0];

  var options = {
    oauth_token        : req.query.oauth_token,
    oauth_token_secret : req.query.oauth_token_secret
  }

  dropbox.get( path, options, function( status, reply ){

//    console.log( status );
//    console.log( reply );

    res.charset = 'utf-8';
    res.contentType( 'text' );
    res.send( reply );

  })

});

/* put */
app.post( /put(.*)/, function(req,res) {

  var path =  req.params[0];
  var body =  req.body.text;

  var options = {
    oauth_token        : req.body.oauth_token,
    oauth_token_secret : req.body.oauth_token_secret
  }

  dropbox.put( path, body, options, function( status, reply ){

//    console.log(status)
//    console.log(reply)

    res.contentType( 'json' );
    res.send( reply );

  });

});

/* document root */
app.get( '/', function( req, res ) {
  res.redirect( '/importer.html' );
});

// Server Start
app.listen(8080);
