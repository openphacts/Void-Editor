<?php

require_once('xmlrpc/lib/xmlrpc.inc');

$DEBUG = false;

// DBPedia lookup interface
$BASE_DBPEDIA_LOOKUP_URI = "http://lookup.dbpedia.org/api/search.asmx/PrefixSearch?QueryClass=&MaxHits=5&QueryString=";

$NAMESPACES = array(
  	'dcterms' => 'http://purl.org/dc/terms/',
  	'foaf' => 'http://xmlns.com/foaf/0.1/',
	'owl' => 'http://www.w3.org/2002/07/owl#',
	'pav' => 'http://purl.org/pav/2.0/',
  	'rdf' => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  	'rdfs' => 'http://www.w3.org/2000/01/rdf-schema#',
  	'skos' => 'http://www.w3.org/2004/02/skos/core#',
  	'void' => 'http://vocab.dowhatimean.net/neologism/void-tmp#',   	
	'xsd' => 'http://www.w3.org/2001/XMLSchema#',
	//Below namespaces are not used
  	'dbpres' => 'http://dbpedia.org/resource/',
  	'dbpprop' => 'http://dbpedia.org/property/',
  	'dc' => 'http://purl.org/dc/elements/1.1/', 
	'sioc' => 'http://rdfs.org/sioc/ns#',
  	'sioct' => 'http://rdfs.org/sioc/types#',
  	'xfn' => 'http://gmpg.org/xfn/11#',
  	'twitter' => 'http://twitter.com/'
);

$TAB_INDENT = "    ";
$SELF_DS = ":myDS";
$LICENSE_URI = "http://creativecommons.org/licenses/by-sa/3.0/";

$BASE_TTL = "
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix pav: <http://purl.org/pav/2.0/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix void: <http://rdfs.org/ns/void#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <#> .

## your VoID description \n";


/* ve2 INTERFACE */


//// POST interface

if(isset($_POST['dsParams'])){ // generate voiD in Turtle
// 	var_dump(json_decode(stripslashes($_POST['dsParams']), true));
	//NOTE: magic_quotes is a depricated feature. Required to get running on my laptop
	if(get_magic_quotes_gpc()) {
		$dsParams = json_decode(stripslashes($_POST['dsParams']), true);
	} else {
		$dsParams = json_decode($_POST['dsParams'], true);
	}
	echo createVoiDTTL($dsParams);
}

//// GET interface

if(isset($_GET['validate'])){ 	
	echo validateHTTPURI($_GET['validate']);
}

if(isset($_GET['lookupSubject'])){ 	
	echo lookupSubjectInDBPedia($_GET['lookupSubject']);
}

if(isset($_GET['lookupPrefix'])){
	$prefix = $_GET['lookupPrefix'];
	
	if(substr($prefix, 0, 4) == "http") {
		echo $prefix;
	}
	else {
		echo lookupPrefix($prefix);
	}
}

/* ve2 METHODS */
function createVoiDTTL($dsParams){
	global $DEBUG;
	global $NAMESPACES;
	global $SELF_DS;
	global $BASE_TTL;
	global $LICENSE_URI;
	global $TAB_INDENT;
	$retVal = $BASE_TTL;
	$otherStatments = "\n";
	//VoID metadata
	$voidTitle = $dsParams["voidTitle"];
	$voidDescription = $dsParams["voidDescription"];
	$voidCreatedBy = $dsParams["voidCreatedBy"];
	$voidCreatedOn = $dsParams["voidCreatedOn"];
	//Basic metadata
	$dsURI = $dsParams["dsURI"];
	$dsHomeURI = $dsParams["dsHomeURI"];
	$dsName = $dsParams["dsName"];
	$dsDescription = $dsParams["dsDescription"];
	$dsUriNs = $dsParams["dsUriNs"];
	//Provenance and licensing
	$dsOrigin = $dsParams["origin"];
	$pavVersion = $dsParams["pavVersion"];
	switch ($dsOrigin) {
		case "original":
			$provAccessedFrom = $dsParams["provAccessedFrom"];
			$provAccessedOn = $dsParams["provAccessedOn"];
			$provPublishedOn = $dsParams["provPublishedOn"];
			$provModifiedOn = $dsParams["provModifiedOn"];
			$provAccessedBy = $dsParams["provAccessedBy"];
			break;		
		case "retrieved":
			$provRetrievedFrom = $dsParams["provRetrievedFrom"];
			$provRetrievedOn = $dsParams["provRetrievedOn"];
			$provRetrievedBy = $dsParams["provRetrievedBy"];
			break;
		case "imported":
			$provImportedFrom = $dsParams["provImportedFrom"];
			$provImportedOn = $dsParams["provImportedOn"];
			$provImportedBy = $dsParams["provImportedBy"];
			break;
		case "derived":
			$provDerivedFrom = $dsParams["provDerivedFrom"];
			$provDerivedOn = $dsParams["provDerivedOn"];
			$provDerivedBy = $dsParams["provDerivedBy"];
			break;
		default:
			break;
	}
	//Topic List
	$dsTopicURIList = $dsParams["dsTopicURIList"];
	//Vocabulary List
	$dsVocURIList = $dsParams["dsVocURIList"];
	//Access Methods
	$dsSPARQLEndpointURI = $dsParams["dsSPARQLEndpointURI"];
	$dsLookupURI = $dsParams["dsLookupURI"];
	$dsDumpURI = $dsParams["dsDumpURI"];
	
	if(!$dsURI) {
		$dsURI = $SELF_DS;
	} elseif (substr($dsURI, 0, 7) == "http://") {
		$dsURI = "<$dsURI>"; 
	}
	
	//VoID description
	$retVal .= "<> rdf:type void:DatasetDescription ;\n";
	$retVal .= writeString("dcterms:title", $voidTitle);
	$retVal .= writeLongString("dcterms:description", $voidDescription);
	$retVal .= writeURI("pav:createdBy", $voidCreatedBy);
	$retVal .= writeDate("pav:createdOn", $voidCreatedOn);
	$retVal .= "$TAB_INDENT foaf:primaryTopic $dsURI .\n\n";
	// the dataset
	$retVal .= "## your dataset description \n";
	$retVal .= "$dsURI rdf:type void:Dataset ;\n";
	$retVal .= writeURI("foaf:homepage", $dsHomeURI);
	$retVal .= writeString("dcterms:title", $dsName);
	$retVal .= writeLongString("dcterms:description", $dsDescription);
	if($dsLicenseURI){
		$retVal .= writeURI("pav:license", $dsLicenseURI);
	} else {
		$retVal .= writeURI("pav:license", $LICENSE_URI);
	}
	$retVal .= writeString("void:uriSpace", $dsUriNs);
	//Provenance and versions
	switch ($dsOrigin) {
		case "original":
			$retVal .= writeURI("dcterms:publisher", $provAccessedFrom);
			$retVal .= writeDate("pav:accessedOn", $provAccessedOn);
			if ($provPublishedOn) {
				$retVal .= writeDate("dcterms:created", $provPublishedOn);
			}
			if ($provModifiedOn) {
				$retVal .= writeDate("dcterms:modified", $provModifiedOn);
			}
			$retVal .= writeURI("pav:accessedBy", $provAccessedBy);
			if($pavVersion){
				$retVal .= writeString("pav:version", $pavVersion);
			}
			break;
		case "retrieved":
			$retVal .= writeURI("pav:retrievedFrom", $provRetrievedFrom);
			$retVal .= writeDate("pav:retrievedOn", $provRetrievedOn);
			$retVal .= writeURI("pav:retrievedBy", $provRetrievedBy);
			if($pavVersion){
				$retVal .= writeString("pav:version", $pavVersion);
			}
			break;
		case "imported":
			$retVal .= writeURI("pav:importedFrom", $provImportedFrom);
			$retVal .= writeDate("pav:importedOn", $provImportedOn);
			$retVal .= writeURI("pav:importedBy", $provImportedBy);
			if($pavVersion) {
				//Version applies to the original data source
				$otherStatments .= $provImportedFrom . writeString("pav:version", $pavVersion) . ".";
			}
			break;
		case "derived":
			$retVal .= writeURI("pav:derivedFrom", $provDerivedFrom);
			$retVal .= writeDate("pav:derivedDate", $provDerivedOn);
			$retVal .= writeURI("pav:derivedBy", $provDerivedBy);
			if($pavVersion) {
				//Version applies to the original data source
				$otherStatments .= $provDerivedFrom . writeString("pav:version", $pavVersion) . ".";
			}
			break;
		default:
			break;
	}	
	if($dsSPARQLEndpointURI){
		$retVal .= writeURI("void:sparqlEndpoint", $dsSPARQLEndpointURI);
	}
	if($dsLookupURI){
		$retVal .= writeURI("void:uriLookupEndpoint", $dsLookupURI);
	}
	if($dsDumpURI){
		$retVal .= writeURI("void:dataDump", $dsDumpURI);
	}
	if($dsVocURIList){
		$i = 1;
		foreach ($dsVocURIList as $dsVocURI) {
			$retVal .= writeURI("void:vocabulary", $dsVocURI);
			$i++;
		}
	}	
	if($dsTopicURIList){
		$i = 1;
		foreach ($dsTopicURIList as $dsTopicURI) {
			$retVal .= writeURI("dcterms:subject", $dsTopicURI);
			if(count($tdsList) == 0) {
				if($i < count($dsTopicURIList)) $retVal .= " ;\n";
				else $retVal .= " .\n";
			}
			else $retVal .= " ;\n";
			$i++;
		}
	}
// 	if($tdsList){
// 		$i = 1;
// 		foreach ($tdsList as $tdsListItem) {
// 			$retVal .= "$TAB_INDENT void:subset " . $SELF_DS ."-DS$i";
// 			if($i < count($tdsList)) $retVal .= " ;\n";
// 			else $retVal .= " .\n";
// 			$i++;
// 		}
// 	}
	$retVal .= ".";

// 	// linksets 
// 	if($tdsList){
// 		$i = 1;
// 		$retVal .= "\n## datasets you link to\n";
// 		foreach ($tdsList as $tdsListItem) {
// 			$tdsListURI = $tdsListItem["tdsHomeURI"];
// 			$tdsLinkType = $tdsListItem["tdsLinkType"];
// 			$tdsName = $tdsListItem["tdsName"];
// 			$tdsDescription = $tdsListItem["tdsDescription"];
// 			$tdsExampleURI = $tdsListItem["tdsExampleURI"];
			
// 			$retVal .= "\n# interlinking to :DS$i\n";
// 			$retVal .= ":DS$i rdf:type void:Dataset ;\n";
// 			$retVal .= " foaf:homepage <$tdsListURI> ;\n";
// 			$retVal .= " dcterms:title \"$tdsName\" ;\n";
// 			$retVal .= " dcterms:description \"$tdsDescription\"";
// 			if($tdsListItem["tdsExampleURI"]) {
// 				$retVal .= " ; \n";
// 				$retVal .= " void:exampleResource <$tdsExampleURI> .\n\n";
// 			}
// 			else 	$retVal .= " . \n\n";
// 			$retVal .= $SELF_DS ."-DS$i rdf:type void:Linkset ;\n";
// 			$retVal .= " void:linkPredicate <$tdsLinkType> ;\n";
// 			if($dsURI){
// 				$retVal .= " void:target <$dsURI> ;\n";
// 			}
// 			else {
// 				$retVal .= " void:target $SELF_DS ;\n";
// 			}
// 			$retVal .= " void:target :DS$i .\n";
// 			$i++;
// 		}
// 	}

	$retVal .= $otherStatments;
	return $retVal;
}

function writeURI($predicate, $object){
	global $TAB_INDENT;
	return "$TAB_INDENT $predicate <$object> ;\n";
}

function writeString($predicate, $object){
	global $TAB_INDENT;
	return "$TAB_INDENT $predicate \"$object\"^^xsd:string ;\n";
}

function writeLongString($predicate, $object){
	global $TAB_INDENT;
	return "$TAB_INDENT $predicate \"\"\"$object\"\"\"^^xsd:string ;\n";
}

function writeDate($predicate, $object){
	global $TAB_INDENT;
	return "$TAB_INDENT $predicate \"$object\"^^xsd:date ;\n";
}

function validateHTTPURI($URI){
	$ret = "";
	$c = curl_init();
	curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($c, CURLOPT_HEADER, 0);
	curl_setopt($c, CURLOPT_URL, $URI);
	curl_setopt($c,	CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($c, CURLOPT_TIMEOUT, 30);
	curl_exec($c);
	if(!curl_errno($c)) {
		$info = curl_getinfo($c);
		if($info['http_code'] == "200") $ret = "valid";
		else $ret = "non-valid";
	}
	else {
		 $ret = "error";
	}
	curl_close($c);
	return $ret;
}

// see http://lookup.dbpedia.org/api/search.asmx?op=KeywordSearch
function lookupSubjectInDBPedia($keyword){
	global $BASE_DBPEDIA_LOOKUP_URI;
	global $DEBUG;
	
	$matches = array();
	
	$data = file_get_contents($BASE_DBPEDIA_LOOKUP_URI . $keyword);
	$parser = xml_parser_create();
	xml_parse_into_struct($parser, $data, $values);
	xml_parser_free($parser);
	for( $i=0; $i < count($values); $i++ ){
		$match = array();
		
		if($values[$i]['tag'] == strtoupper("Description")) {
			$desc =  $values[$i]['value'];
		}
		if($values[$i]['tag']==strtoupper("Label")){
			$label =  $values[$i]['value'];
		}
		if($values[$i]['tag']==strtoupper("URI") && 
			(strpos($values[$i]['value'], "http://dbpedia.org/resource") == 0) &&
			(strpos($values[$i]['value'], "Category:") === false)
		){ // use only resource URIs and exclude category resource URIs
			$URI =  $values[$i]['value'];
		}
		
		if(isset($URI) && isset($desc)&& isset($label)) {
			$match['URI'] = $URI;
			$match['label'] = $label;
			$match['desc'] = $desc;
			
			array_push($matches, $match);
			if($DEBUG) {
				echo "<strong>" . $URI . "</strong>:<p>" . $desc . "</p>" ;
			}
			unset($URI);
			unset($desc);
			unset($label);
		}
	}
	return json_encode($matches);
}

function lookupVoiD($lookupURI, $browseURI, $homepageURI){
	global $DEBUG;
	global $BASE_RKB_LOOKUP_URI;
	
	//NOTE: this should be the same for all store, but due to http://void.rkbexplorer.com/known-limitations/ we have to make a case distinction
	if($lookupURI == $BASE_RKB_LOOKUP_URI ){ // treat RKB special, ie exact match
		$query = "SELECT DISTINCT ?ds WHERE { ?ds a <http://rdfs.org/ns/void#Dataset> ; <http://xmlns.com/foaf/0.1/homepage> <$homepageURI> . }";
	}
	else { // do partial match
		$query = "SELECT DISTINCT ?ds WHERE { ?ds a <http://rdfs.org/ns/void#Dataset> ; <http://xmlns.com/foaf/0.1/homepage> ?hp . FILTER regex(str(?hp), \"$homepageURI\") . }";	
	}
	
	if($DEBUG) echo $query . "<br />\n";
	
	$jsondata = file_get_contents($lookupURI . urlencode($query));
	if($DEBUG) var_dump($jsondata);
	
	$data = json_decode($jsondata, true); 
	
	if($DEBUG) var_dump($data["results"]["bindings"][0]["ds"]["value"]);
	
	$val = $data["results"]["bindings"][0]["ds"]["value"];
	$type = $data["results"]["bindings"][0]["ds"]["type"];
	
	if($type == "uri") $val = urlencode($val);
	
	$browseParams = "type=$type&uri=$val";
	
	return $browseURI . $browseParams;
}

function listVoiD($lookupURI){
	global $DEBUG;
	
	$voiDInfoList = array();
	
	$query = "SELECT DISTINCT ?ds ?title ?hp WHERE { ?ds a <http://rdfs.org/ns/void#Dataset> ;  <http://purl.org/dc/terms/title> ?title ; <http://xmlns.com/foaf/0.1/homepage> ?hp . } ORDER BY ?title ";
	if($DEBUG) echo $query . "<br />\n";
	
	$jsondata = file_get_contents($lookupURI . urlencode($query));
	if($DEBUG) var_dump($jsondata);
	
	$data = json_decode($jsondata, true); 
	
	foreach($data["results"]["bindings"] as $binding){
		$voiDInfo = array();
		$id = $binding["ds"]["value"];		
		$title = $binding["title"]["value"];
		$homepage = $binding["hp"]["value"];
		if($DEBUG) echo "<a href='$homepage' target='_new' title='$homepage'>$title</a> (in dataset $id)<br />\n";
		$voiDInfo['id'] = $id;
		$voiDInfo['title'] = $title;
		$voiDInfo['homepage'] = $homepage;
		array_push($voiDInfoList, $voiDInfo);
	}
	
	return json_encode($voiDInfoList);
}

function inspectVoiDLive($voiDInTTL){
	$webInspectorServiceURI = "http://apps.sindice.net:8080/rdfextractor/rdfextract";
	$fields = array(
	        'content'=>urlencode($voiDInTTL),
	        'format'=> "turtle"
	);

	foreach($fields as $key=>$value) {
		$fields_string .= $key.'='.$value.'&';
	}
	rtrim($fields_string,'&');
	
	$ch = curl_init();
	curl_setopt($ch,CURLOPT_URL,$webInspectorServiceURI);
	curl_setopt($ch,CURLOPT_POST,count($fields));
	curl_setopt($ch,CURLOPT_POSTFIELDS,$fields_string);
	//execute post
	$result = curl_exec($ch);
	//close connection
	curl_close($ch);
	return $result;
}

function inspectVoiD($voiDInTTL){
	$webInspectorServiceURI = "http://sindice.com/developers/inspector?url=";
	$tmpVoiDURI = dumpVoid($voiDInTTL);
	return $webInspectorServiceURI . urlencode($tmpVoiDURI );
}

function dumpVoid($voiDInTTL){
	$search  = array(' ', '.');
	$replace = array('', '');
	$tmpVoiDFileName =  "tmp/void_" . microtime();
	$tmpVoiDFileName =  str_replace ($search, $replace, $tmpVoiDFileName) . ".ttl";
	
	$fh = fopen($tmpVoiDFileName, 'a') or die("Can't open temp voiD file ...");
	fwrite($fh, $voiDInTTL);
	fclose($fh);
	return "http://" . $_SERVER["HTTP_HOST"] . "/ve2/" . $tmpVoiDFileName;
}

function lookupPrefix($prefix){
	$ret = "";
	$c = curl_init();
	curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($c, CURLOPT_HEADER, 0);
	curl_setopt($c, CURLOPT_URL, "http://prefix.cc/" . strtolower($prefix) . ".json.plain");
	curl_setopt($c, CURLOPT_TIMEOUT, 30);
	$result = curl_exec($c);
	curl_close($c);
	$result = json_decode($result, true);
	return $result[strtolower($prefix)];
}

// ping a service that supports  http://hixie.ch/specs/pingback/pingback
function pingback($servicetitle, $endpoint, $title, $URI) {
	global $DEBUG;
	
	$client = new xmlrpc_client($endpoint);
	$payload = new xmlrpcmsg("weblogUpdates.ping");
	
	$payload->addParam(new xmlrpcval($title));
	$payload->addParam(new xmlrpcval($URI));
	
	if ($DEBUG) {
		$client->setDebug(2);
	}
	
	$response = $client->send($payload);
	$xmlresponsestr = $response->serialize();
	
	$xml = simplexml_load_string($xmlresponsestr);
	$result = $xml->xpath("//value/boolean/text()");
 	if($result) {
		if($result[0] == "0"){
			return "<p>Submitting $URI to $servicetitle succeeded.</p>";
		}
	}
	else {
		$err = "Error Code: " . $response->faultCode() . "<br /> Error Message: " . $response->faultString();
		return "<p>Failed to submit $URI to $servicetitle.</p>";
	}
}

// ping a service with RESTful API
function ping($servicetitle, $endpoint, $queryParam, $URI){
	$fields = array(
	        $queryParam =>urlencode($URI)
	);
	foreach($fields as $key=>$value) {
		$fields_string .= $key.'='.$value.'&';
	}
	rtrim($fields_string,'&');

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch,CURLOPT_URL,$endpoint);
	curl_setopt($ch,CURLOPT_POST,count($fields));
	curl_setopt($ch,CURLOPT_POSTFIELDS,$fields_string);
	$result = curl_exec($ch);	
	if(!curl_errno($ch)) {
		$info = curl_getinfo($ch);
		if($info['http_code'] == "200") {
			return "<p>Submitting $URI to $servicetitle succeeded.</p>";
		}
		else {
			return "<p>Failed to submit $URI to $servicetitle.</p>";
		}
	}
	else {
		 return "<p>Failed to submit $URI to $servicetitle.</p>";
	}
	curl_close($ch);
	return $ret;
}


?>