
	//<script type="text/javascript">
  function highLightElement(e) {
    var ele = e.target;
    var eleId = ele.id;
    var eleRel = ele.getAttribute('rel');
    ele.className += " clicked";
    console.log("Element ID is " + eleId);
    console.log("Element Rel is " + eleRel);
  }
  var CONSTRUCT = {
    timer: false,
    logSubjects: false,
    theme: {
      primary: '#E91E63',
      accent: '#607D8B',
      name: 'kia-dark-theme',
      isDark: true,
    },
    ids: {

    },
    accu: [],
    elements: {

    },
    undos: []
  };
  if (CONSTRUCT.timer) console.time("since JS start");
  var PRIM = {};
  var FUNC = {};
  var ROLE = {};
  var OPUS_DIR = {};
  var CalcAll = {};
//</script>


//<script>
// window.dataLayer = window.dataLayer || [];
// function gtag() { dataLayer.push(arguments); }
// gtag('js', new Date());
//</script>