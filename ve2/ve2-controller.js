/******************************************************/
/* ve2 data-controller and service conmmunicate code  */
/******************************************************/

function createSkeletonVoiD() {
	var data = extractData(); 
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
			alert(data);
			setStatus("Error creating voiD description.");
		} 
	});	
}

function createVoiD(section){

	var data = extractData(); 
	if (validateData(data, section)) {
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
				alert(data);
				setStatus("Error creating voiD description.");
			} 
		});
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
	data.dsUriNs = $("#dsUriNs").val();
//	//License and provenance
	data.dsPublisherURI = $("#dsPublisherURI").val();
	data.dsSourceURI = $("#dsSourceURI").val();
	data.dsVersion = $("#dsVersion").val();
//	//Other stuff
//	var dsExampleURIList = new Array();
//	var dsTopicURIList = new Array();
//	var tdsList = new Array();
//	var dsVocURIList = new Array();
//	var dsSPARQLEndpointURI = $("#dsSPARQLEndpointURI").val();
//	var dsLookupURI = $("#dsLookupURI").val();
//	var dsDumpURI = $("#dsDumpURI").val();
	return data;
}

function validateData(data, section) {
	switch (section)
	{
		case "void-metadata":
			return validateVoidMetadata(data);
			break;
		case "ds-metadata":
			return validateDSMetadata(data);
			break;
		default:
			if (!validateVoidMetadata(data)) return false;
			if (!validateDSMetadata(data)) return false;
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
//		alert($("#dsItemsSelection").accordion( "option", "active" ));
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
	if (data.dsLicenseURI == "other") {
		data.dsLicenseURI = $("#dsLicenseURIOther").val();
		if (data.dsLicenseURI == "" || (data.dsUriNs.substring(0,7) != "http://")) {
			alert("You have chosen to supply your own license. Please provide the URI for the license.");
			$("#dsItemSelection").accordion('activate', 1 );
			$("#dsLicenseURIOther").focus();
			return false;
		}
	}
	if(data.dsUriNs == "" || (data.dsUriNs.substring(0,7) != "http://")){
		alert("Please provide the URI namespace for the dataset.");
		$("#dsItemSelection").accordion('activate', 1 );
		$("#dsUriNs").focus();
		return false;
	}
	return true;
}
//
////	if(dsLicenseURI == "" || (dsHomeURI.substring(0,7) != "http://")) {
////		alert("You have to provide a license for the dataset. The license must be a URI starting with 'http://'.");
////		return false;
////	}
////	else data.dsLicenseURI = escape(dsLicenseURI);
//	data.dsLicenseURI = dsLicenseURI;
//	data.dsVersion = dsVersion;
//	
//	// provenance and licensing
//	if (!$("#doMinimal").is(':checked')) { // don't take into account for minimal voiD file
//		data.dsPublisherURI = dsPublisherURI;
//		data.dsSourceURI = dsSourceURI;
////		data.dsLicenseURI = dsLicenseURI;
//	}
//	
//	$(".dsExampleURI input").each(function (i) {
//		dsExampleURIList.push($(this).val());
//	});
//	data.dsExampleURIList = dsExampleURIList;
//	
//	// topics
//	$("#dsSelectedTopics div span").each(function (i) {
//		dsTopicURIList.push($(this).attr("resource"));
//	});
//	data.dsTopicURIList = dsTopicURIList;
//	
//	// interlinking
//	$("#tdsAddedTargets > div").each(function (i) {
//		var target = {
//			tdsHomeURI : $(this).find("a").attr("href"),
//			tdsLinkType : $(this).find("div span.tlinktype").text(),
//			tdsName : $(this).find("a").text(),
//			tdsDescription : $(this).find("a").attr("title"),
//			tdsExampleURI : $(this).find("div span.texample").text()
//		}
//		tdsList.push(target);
//	});
//	data.tdsList = tdsList;
//	// vocabularies
//	$(".dsVocURI input").each(function (i) {
//		dsVocURIList.push($(this).val());
//	});
//	data.dsVocURIList = dsVocURIList;
//	
//	// access methods
//	if (!$("#doMinimal").is(':checked')) { // don't take into account for minimal voiD file
//		data.dsSPARQLEndpointURI = dsSPARQLEndpointURI;
//		data.dsLookupURI = dsLookupURI;
//		data.dsDumpURI = dsDumpURI;
//		return true;
//	}
//	
//function validateValue(value, errorString){
//	if(value == "") {
//		alert("You have to provide a " + errorString + ".");
//		return false;
//	} else {
//		return true;
//	}
//}
//
//function validateUriValue(URI, errorString){
//	if(URI == "" || (URI.substring(0,7) != "http://")) {
//		alert("You have to provide a " + errorString + ". This must be a URI starting with 'http://'.");
//		return false;
//	} else {
//		return true;
//	}
//}

function validateURI(URI){
	setStatus("Validating " + URI);
	$.ajax({
		type: "GET",
		url: ve2ServiceURI,
		data: "validate="+ URI,
		success: function(data){
			alert(URI + " is " + data);
			setStatus(URI + " is " + data);
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

function getDatasetList(store){
	setStatus("Retrieving list of datasets from voiD stores.");

	$.ajax({
		type: "GET",
		url: ve2ServiceURI,
		data: "listVoiD",
		dataType : "json",
		success: function(data){
			if(data && data.length > 0) {
				$("#tdsPreview").append("<div style='border: 1px solid #1d1d1d'>Store: <strong>"+ store +"</strong></div>");
				for(i in data) {
					var id = data[i].id;
					var title = data[i].title;
					var homepage = data[i].homepage;
					$("#tdsPreview").append("<span style='font-size: 90%; padding-left: 5px;' title='"+ id + "'>"+ title + "</span><br />");
				}
				setStatus("Ready");
			}		
		}
	});
}

function peekTargetDataset(store){
	setStatus("Looking up dataset description");
	var tdsHomeURI = $("#tdsHomeURI").val();

	$.ajax({
		type: "GET",
		url: ve2ServiceURI,
		data: "store=" + store + "&lookupVoiDViaHompage="+ tdsHomeURI,
		success: function(data){
			$("#tdsPreview").append("<div>Dataset with homepage " + tdsHomeURI + ": <a href='" + data + "' title='Preview dataset in RKB explorer' target='_new'>preview URI</a> (via " + store + ")</div>");
		}
	});
}

function lookupPrefix(){
	var tdsLinkType = $("#tdsLinkType").val();
	if(tdsLinkType.substring(0,7) != "http://") {
		$.ajax({
			type: "GET",
			url: ve2ServiceURI,
			data: "lookupPrefix="+ tdsLinkType,
			success: function(data){
				$("#tdsLinkType").val(data);
			}		
		});
	}
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
				createVoiD();
			}		
		});
	}
}

function autocompletes(){
	var tdsLinkType = $("#tdsLinkType").val();
	if(tdsLinkType.substring(0,7) != "http://") { // we have presumably a prefix to resolve
		var separatorPosition = tdsLinkType.indexOf(":"); // abc:def -> will return 3
		var prefix = tdsLinkType.substring(0, separatorPosition);
		var localname = tdsLinkType.substring(separatorPosition + 1);
		
		$.ajax({
			type: "GET",
			url: ve2ServiceURI,
			data: "lookupPrefix="+ prefix,
			success: function(data){
				$("#tdsLinkType").val(data + localname);
			}		
		});		
	}
}
