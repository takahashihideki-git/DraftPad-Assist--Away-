// HTML Code Template Class based on jQuery

var HTMLCodeTemplate = function  ( jElement ) {

  this.jelement = jElement;
  this.container = $( "<div>" );
  this.templateStr = "";
  this.template = {};

}

HTMLCodeTemplate.prototype = {

  getTemplateStr : function ( selector ) {

    $( this.container ).empty();
    this.templateStr = "";
    this.template = {};
  
    $( this.container ).append( $( this.jelement ).find( selector ).clone() )
    this.templateStr = $( this.container ).html().replace( /\n/g, "" );
  
    while( this.templateStr.match( /<!-- *{ *([^/ ]+) *} *-->/ ) ) {
      var subTemplateKey = RegExp.$1; 
      this.templateStr = this.getSubTemplateStr( subTemplateKey, this.templateStr );
    }
    this.template[ "main" ] = this.templateStr;

    return this.template;

  },

  getSubTemplateStr : function ( subTemplateKey, templateStr ) {

    var regExp = new RegExp( "<!-- *{ *" + subTemplateKey + " *} *-->(.*)<!-- *{ *\/" + subTemplateKey + " *} *-->" ); 
    var matches = templateStr.match( regExp );
    var subTemplateStr = matches[1];

    if ( subTemplateStr.match( /<!-- *{ *([^/ ]+) *} *-->/ ) ) {
      var subSubTemplateKey = RegExp.$1;
      subTemplateStr = this.getSubTemplateStr( subSubTemplateKey, subTemplateStr )
    }

    this.template[ subTemplateKey ] = subTemplateStr;

    return templateStr.replace( regExp, "{" + subTemplateKey + "}" );
    
  }

}