/******************************************************/
/* ve2 data-controller and service conmmunicate code  */
/******************************************************/

var validURIs = new Array();

function createVoID(){
	var data = extractData();
	setStatus("Validating input ...");
	if (validateData(data)) {
		setStatus("Submitting data ...");
		$.ajax({
			type: "POST",
			url: ve2ServiceURI,
			data: "dsParams="+ $.toJSON(data),
			success: function(data){
				$("#vdOutput").val(data);
				setStatus("Ready");
			},
			error:  function(msg){
				alert("Error processing data: " + data);
				setStatus("Error creating VoID description.");
			} 
		});	
	} else {
		setStatus("Input not valid.");
	}
}

function extractData(){
	var data = {};
	//VoID metadata
	data.voidTitle = $("#voidTitle").val();
	data.voidDescription = $("#voidDescription").val();
	data.voidCreatedBy = $("#voidCreatedBy").val();
	data.voidCreatedOn = $("#voidCreatedOn").val();
	//General metadata
	data.dsURI = $("#dsURI").val();	
	data.dsHomeURI = $("#dsHomeURI").val();
	data.dsName = $("#dsName").val();
	data.dsDescription = $("#dsDescription").val();
	data.dsLicenseURI = $("#dsLicenseURI").val();
	if (data.dsLicenseURI == "other") {
		data.dsLicenseURI = $("#dsLicenseURIOther").val();
	}
	data.dsUriNs = $("#dsUriNs").val();
	//Provenance
	data.origin = $("input[name=data-origin]:checked").val();
	switch (data.origin) {
	case "original":
		data.provAccessedFrom = $("#provAccessedFrom").val();
		data.pavVersion = $("#pavAccessedVersion").val();
		data.provAccessedOn = $("#provAccessedOn").val();
		data.provPublishedOn = $("#provPublishedOn").val();
		data.provModifiedOn = $("#provModifiedOn").val();
		data.provAccessedBy = $("#provAccessedBy").val();
		break;
	case "retrieved":
		data.provRetrievedFrom = $("#provRetrievedFrom").val();
		data.pavVersion = $("#pavRetrievedVersion").val();
		data.provRetrievedOn = $("#provRetrievedOn").val();
		data.provRetrievedBy = $("#provRetrievedBy").val();	
		break;
	case "imported":
		data.provImportedFrom = $("#provImportedFrom").val();
		data.pavVersion = $("#pavImportedVersion").val();
		data.provImportedOn = $("#provImportedOn").val();
		data.provImportedBy = $("#provImportedBy").val();	
		break;
	case "derived":
		data.provDerivedFrom = $("#provDerivedFrom").val();
		data.pavVersion = $("#pavDerievedVersion").val();
		data.provDerivedOn = $("#provDerivedOn").val();
		data.provDerivedBy = $("#provDerivedBy").val();	
		break;
	default:
		break;
	}
	// topics
	var dsTopicURIList = new Array();
	$("#dsSelectedTopics div span").each(function (i) {
		dsTopicURIList.push($(this).attr("resource"));
	});
	data.dsTopicURIList = dsTopicURIList;
	// Example resources
	var dsExampleURIList = new Array();
	$(".dsExampleURI input").each(function (i) {
		var exampleURI = ($(this).val());
		if ($.inArray(exampleURI, validURIs) >= 0) {
			dsExampleURIList.push(exampleURI);
		}
	});
	data.dsExampleURIList = dsExampleURIList;
	//Subsets
	var subsetList = new Array();
	$("#existingSubsets > div").each(function (i) {
		var subset = {
				subsetURI : $(this).find("div span.ibtn").attr("resource"),
				subsetName : $(this).find("div span.subsetName").text(),
				subsetNSURI : $(this).find("div span.subsetNSURI").text()
		};
		subsetList.push(subset);
	});
	if (subsetList.length > 0) {
		data.dsSubsets = subsetList;
	}
	//Access methods information
	data.dsSPARQLEndpointURI = $("#dsSPARQLEndpointURI").val();
	data.dsLookupURI = $("#dsLookupURI").val();
	data.dsDumpURI = $("#dsDumpURI").val();
	return data;
}

function validateData(data) {
	if (!validateVoidMetadata(data)) return false;
	if (!validateDSMetadata(data)) return false;
	if (!validateProvMetadata(data)) return false;
	if (!validateAccessMethods(data)) return false;
	return true;
}

function validateSection(section) {
	var data = extractData();
	switch (section)
	{
		case "void-metadata":
			return validateVoidMetadata(data);
			break;
		case "ds-metadata":
			return validateDSMetadata(data);
			break;
		case "ds-provenance":
			return validateProvMetadata(data);
			break;
		case "ds-topic":
			break;
		case "ds-example":
			break;
		case "accessMethods":
			return validateAccessMethods(data);
			break;
		default:
			return true;
			break;
	}
	return false;
}

function validateVoidMetadata(data) {
	// VoID metadata
	if (data.voidTitle == "") {
		alert("Please provide a title for your VoID document.");
		$("#dsItemSelection").accordion('activate', 0 );
		$("#voidTitle").focus();
		return false;
	}
	if (data.voidDescription == "") {
		alert("Please provide a description for your VoID document.");
		$("#dsItemSelection").accordion('activate', 0 );
		$("#voidDescription").focus();
		return false;
	}
	if (data.voidCreatedBy == "" || (data.voidCreatedBy.substring(0,7) != "http://")) {
		alert("Please provide a URI for your identity.");
		$("#dsItemSelection").accordion('activate', 0 );
		$("#voidCreatedBy").focus();
		return false;
	}
	return true;
}

function validateDSMetadata(data) {
	// general dataset metadata
	if(data.dsURI != "" && 
			!((data.dsURI.substring(0,7) == "http://") || (data.dsURI.substring(0,1) == ":"))) {
		alert("If you provide a dataset URI, it must be a URI starting with 'http://' or a relative URI starting with ':'.");
		$("#dsItemSelection").accordion('activate', 1 );
		$("#dsURI").focus();
		return false;
	}
	if(data.dsHomeURI == "" || (data.dsHomeURI.substring(0,7) != "http://")) {
		alert("You must provide dataset homepage. This must be a URI starting with 'http://'.");
		$("#dsItemSelection").accordion('activate', 1 );
		$("#dsHomeURI").focus();
		return false;
	}
	if(data.dsName == "") {
		alert("Please provide a name for your dataset.");
		$("#dsItemSelection").accordion('activate', 1 );
		$("#dsName").focus();
		return false;
	}	
	if(data.dsDescription == "") {
		alert("Please provide a name for your dataset.");
		$("#dsItemSelection").accordion('activate', 1 );
		$("#dsDescription").focus();
		return false;
	}
	if (data.dsLicenseURI == "" || (data.dsUriNs.substring(0,7) != "http://")) {
		alert("You have chosen to supply your own license. Please provide the URI for the license.");
		$("#dsItemSelection").accordion('activate', 1 );
		$("#dsLicenseURIOther").focus();
		return false;
	}
	if(data.dsUriNs == "" || (data.dsUriNs.substring(0,7) != "http://")){
		alert("Please provide the URI namespace for the dataset.");
		$("#dsItemSelection").accordion('activate', 1 );
		$("#dsUriNs").focus();
		return false;
	}
	return true;
}

function validateProvMetadata(data) {
	switch (data.origin) {
	case "original":
		if(data.provAccessedFrom == "" || (data.provAccessedFrom.substring(0,7) != "http://")) {
			alert("Please provide the URI for the dataset on the web.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provAccessedFrom").focus();
			return false;
		}
		if(data.provAccessedBy == "" || (data.provAccessedBy.substring(0,7) != "http://")) {
			alert("Please provide a URI for the person/organisation who accessed the dataset.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provAccessedBy").focus();
			return false;
		}
		break;
	case "retrieved":
		if(data.provRetrievedFrom == "" || (data.provRetrievedFrom.substring(0,7) != "http://")) {
			alert("Please provide the URI where the dataset was retrieved from.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provRetrievedFrom").focus();
			return false;
		}
		if(data.provRetrievedOn == "") {
			alert("Please select the date when the data was retrieved.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provRetrievedOn").focus();
			return false;
		}
		if(data.provRetrievedBy == "" || (data.provRetrievedBy.substring(0,7) != "http://")) {
			alert("Please provide a URI for the person/organisation who retrieved the dataset.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provRetrievedBy").focus();
			return false;
		}
		break;
	case "imported":
		if(data.provImportedFrom == "" || (data.provImportedFrom.substring(0,7) != "http://")) {
			alert("Please provide the URI where the original dataset was retrieved from.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provImportedFrom").focus();
			return false;
		}
		if(data.provImportedOn == "") {
			alert("Please select the date when the data was converted.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provImportedOn").focus();
			return false;
		}
		if(data.provImportedBy == "" || (data.provImportedBy.substring(0,7) != "http://")) {
			alert("Please provide a URI for the person/organisation who converted the dataset.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provImportedBy").focus();
			return false;
		}
		break;
	case "derived":
		if(data.provDerivedFrom == "" || (data.provDerivedFrom.substring(0,7) != "http://")) {
			alert("Please provide the URI where the original dataset was retrieved from.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provDerivedFrom").focus();
			return false;
		}
		if(data.provDerivedOn == "") {
			alert("Please select the date when the data was processed.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provDerivedOn").focus();
			return false;
		}
		if(data.provDerivedBy == "" || (data.provDerivedBy.substring(0,7) != "http://")) {
			alert("Please provide a URI for the person/organisation who processed the dataset.");
			$("#dsItemSelection").accordion('activate', 2);
			$("#provDerivedBy").focus();
			return false;
		}
		break;
	default:
		alert("Please provide the provenance of the dataset.");
		$("#dsItemSelection").accordion('activate', 2);
		return false;
		break;
	}
	return true;
}

function validateAccessMethods(data) {
	if(data.dsSPARQLEndpointURI != "" && (data.dsSPARQLEndpointURI.substring(0,7) != "http://")) {
		alert("Please provide a URL for the SPARQL endpoint, or leave it blank.");
		$("#dsItemSelection").accordion('activate', 6);
		$("#dsSPARQLEndpointURI").focus();
		return false;
	}
	if(data.dsLookupURI != "" && (data.dsLookupURI.substring(0,7) != "http://")) {
		alert("Please provide a URL for the lookup endpoint, or leave it blank.");
		$("#dsItemSelection").accordion('activate', 6);
		$("#dsLookupURI").focus();
		return false;
	}
	if(data.dsDumpURI != "" && 
			((data.dsDumpURI.substring(0,7) != "http://") &&
			(data.dsDumpURI.substring(0,6) != "ftp://"))) {
		alert("Please provide a URL or FTP location for the RDF data dump, or leave it blank.");
		$("#dsItemSelection").accordion('activate', 6);
		$("#dsDumpURI").focus();
		return false;
	}
	return true;
}

function validateExampleResourceURI(URI, positionId){
	setStatus("Validating " + URI);
	$.ajax({
		type: "GET",
		url: ve2ServiceURI,
		data: "validate="+ URI,
		success: function(data){
			if(data == "true") {
				setStatus("Ready");
				validURIs.push(URI);
				createVoID();
			} else {
				setStatus("Invalid URI: " +  URI);
				alert(URI + " is not a resolvable URI.");
				$("#dsItemSelection").accordion('activate', 4);
				$(positionId).focus();
			}
		}
	});
}

function lookupSubject(topic){
	setStatus("Looking up topic [" + topic + "] in DBpedia.");
	$.ajax({
		type: "GET",
		url: ve2ServiceURI,
		data: "lookupSubject="+ topic,
		dataType : "json",
		success: function(data){
			if(data && data.length > 0) {
				setStatus("Ready");
				$("#dsTopicOut").html("");
				for(i in data) {
					var URI = data[i].URI;
					var desc = data[i].desc;
					var label = data[i].label;
					if(i < maxNumOfTopicsProposed) {
						$("#dsTopicOut").append("<div class='topicopt'><span resource='"+ URI +"' content='"+ label +"' title='"+ desc +"'>" + label + "</span> [<a href='"+ URI + "' target='_new'>URI</a>] </div>");
					}
				}
				$("#dsTopicOut").show("normal");
			}		
		}
	});
}

function lookupVoc(inputID){
	var vocPrefix = $("#"+inputID+" input").val();
	if(vocPrefix.substring(0,7) != "http://") {
		$.ajax({
			type: "GET",
			url: ve2ServiceURI,
			data: "lookupPrefix="+ vocPrefix,
			success: function(data){
				$("#"+inputID+" input").val(data);
				createVoID();
			}		
		});
	}
}

//function autocompletes(){
//	var tdsLinkType = $("#tdsLinkType").val();
//	if(tdsLinkType.substring(0,7) != "http://") { // we have presumably a prefix to resolve
//		var separatorPosition = tdsLinkType.indexOf(":"); // abc:def -> will return 3
//		var prefix = tdsLinkType.substring(0, separatorPosition);
//		var localname = tdsLinkType.substring(separatorPosition + 1);
//		
//		$.ajax({
//			type: "GET",
//			url: ve2ServiceURI,
//			data: "lookupPrefix="+ prefix,
//			success: function(data){
//				$("#tdsLinkType").val(data + localname);
//			}		
//		});		
//	}
//}
