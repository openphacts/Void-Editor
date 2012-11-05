/********************************************************/
/* ve2 user interface and client-side interaction code  */
/********************************************************/
//////////////////////////////
// config

// the ve2 service 
var  ve2ServiceURI = "ve2-service.php"; 
//min. length for a keyword to trigger live look-up in DBPedia
var  topicLookUpMinLength = 3; 
//max. numbers of topics shown in the result of the live look-up in DBPedia
var  maxNumOfTopicsProposed = 10; 

// working vars - don't touch
var dsExampleURICounter = 0;
var dsTopicCounter = 0;
var dsVocURICounter = 0;
var today = new Date();
var subsetIds = new Array();
var currentSection = "void-metadata";

// UI helper methods

function initUI(){
	$("a[href='ref1']").attr("href", opsvgREFVoIDDescription);
	$("a[href='ref2']").attr("href", opsvgREFDataset_Metadata);
	$("a[href='ref3']").attr("href", voidREFTargets);
	$("a[href='ref4']").attr("href", voidREFExamples);
	$("a[href='ref5']").attr("href", voidREFAccess);
	
}

function clearTopics(){
	$("#dsTopicOut").hide("fast");
	$("#dsTopicOut").html("");
	$("#dsTopic").val("");
}

function replaceSpaces(string, char) {
	return string.split(' ').join(char);
}

function setStatus(status){
	$("#status").text(status);
	$("#status").fadeIn(1000);
}

// jQuery main interaction code
$(function(){

	$("#provAccessedOn").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd",
		maxDate: today
	});
	$("#provPublishedOn").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd",
		maxDate: today
	});
	$("#provModifiedOn").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd",
		maxDate: today
	});
	$("#provRetrievedOn").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd",
		maxDate: today
	});
	$("#provImportedOn").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd",
		maxDate: today
	});
	$("#provDerivedOn").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd",
		maxDate: today
	});

	initUI(); // reset all values to defaults
	
	// set up left-hand main navigational structure
	$("#dsItemSelection").accordion({ 
		header: "h3",
		autoHeight: false,
	 });
	
	// general buttons
	$("#doStart").click(function () {
		$("#intro").fadeOut("slow");
	});
	
	$("#about").dialog({
		autoOpen: false,
		width: 800,
		modal: true
	});
	
	$("#doAbout").click(function () {
		$("#about").dialog("open");
	});
	
	$("#doCreate").click(function () {
		createVoID();
	});

	////////////////////////////////////////////////
	// Provenace interactions
	$('#doProvOriginalSelect').change(function () {
		$("#provOriginalPane").show("normal");
		$("#provRetrievedPane").hide("normal");
		$("#provImportedPane").hide("normal");
		$("#provDerivedPane").hide("normal");
	});
	
	$('#doProvRetrievedSelect').change(function () {
		$("#provOriginalPane").hide("normal");
		$("#provRetrievedPane").show("normal");
		$("#provImportedPane").hide("normal");
		$("#provDerivedPane").hide("normal");
	});
	
	$('#doProvImportedSelect').change(function () {
		$("#provOriginalPane").hide("normal");
		$("#provRetrievedPane").hide("normal");
		$("#provImportedPane").show("normal");
		$("#provDerivedPane").hide("normal");
	});
	
	$('#doProvDerivedSelect').change(function () {
		$("#provOriginalPane").hide("normal");
		$("#provRetrievedPane").hide("normal");
		$("#provImportedPane").hide("normal");
		$("#provDerivedPane").show("normal");
	});
	
	/////////////////////////////////
	// handle dataset topic selection
		
	// add a topic
	$(".topicopt span").live("click", function() {
		var selectedURI = $(this).attr("resource");
		var label = $(this).attr("content");
		$("#dsSelectedTopics").append(
			"<div style='margin: 3px'><a href='"+ selectedURI +
				"' target=\"_blank\">" + label + "</a> " +
				" <span resource='"+ selectedURI + "' class='ibtn' " +
						"title='Remove this topic'>-</span>" + 
				"</div>");
		$("#dsSelectedTopics").show("normal");		
		clearTopics();
		dsTopicCounter++;
		createVoID();
	});
	
	// remove a topic
	$("#dsSelectedTopics span.ibtn").live("click", function() {
		var selectedURI = $(this).attr("resource");
		$("#dsSelectedTopics div span[resource='"+selectedURI+"']").parent().remove();
		createVoID();
		dsTopicCounter--;
		if(dsTopicCounter <= 0) {
			$("#dsSelectedTopics").hide("normal");
			$("div:contains('Provided Dataset Topics')").css("color", "#3f3f3f");
		}
	});
	
	// reset topics
	$("#doClearTopics").live("click", function() {
		clearTopics();
	});
	
	// look-up a topic
	$("#dsTopic").keyup(function () {
		var topic = $("#dsTopic").val();
		$("#dsTopicOut").html("");
		$("#dsTopicOut").hide("normal");
		if (topic.length >= topicLookUpMinLength) {
			lookupSubject(topic);
			$("div:contains('Provided Dataset Topics')").css("color", "#666");
		}
	});
	
	//////////////////////
	// handle example URIs
	$(".dsExampleURI .btn").live("click", function() {
		var exURI = $(this).parent().attr('id');
		validateExampleResourceURI($("#"+exURI+" input").val(), exURI);
	});
	
	$("#doAddDSExampleURI").click(function () {
		$("#dsExampleURI").append("<div class='dsExampleURI' id='dsExampleURI" + 
				dsExampleURICounter +"'><input type='text' size='35' " +
						"class='dsExampleURIVal' /> <span class='ibtn' " +
						"title='Remove this example resource'>-</span> " +
						"<span class='btn'>Validate</span></div>");
		dsExampleURICounter++;
	});
	
	$(".dsExampleURI .ibtn").live("click", function() {
		var exURI = $(this).parent().attr('id');
		$("#"+exURI).remove();
		createVoID();
	});

	//////////////////////
	// handle subset generation
	
	// show subset editing pane
	$("#doShowSubsetPane").click(function() {
		$("#subsetPane").show("normal");
	});
	
	// hide subset editing pane
	$("#doForgetSubset").click(function() {
		$("#subsetName").val("");
		$("#subsetNSURI").val("");
		$("#subsetPane").hide("normal");
	});
	
	// Add subset details
	$("#doAddSubset").click(function() {
		var subsetName = $("#subsetName").val();
		var subsetNSURI = $("#subsetNSURI").val();
		if(subsetName == "") {
			alert("You need to provide a unique name for the subset.");
			$("#subsetName").focus();
			return;
		}
		subsetURI = replaceSpaces(subsetName, '_');
		if($.inArray(subsetURI, subsetIds) >= 0) {
			alert("The name for the dataset must be unique. " + 
					subsetName + " already used.");
			$("#subsetName").focus();
			return;
		} 
		if(subsetNSURI == "" || (subsetNSURI.substring(0,7) != "http://")) {
			alert("You need to provide the URI namespace for the subset.");
			$("#subsetNSURI").focus();
			return;
		}
		$("div:contains('Provided Subsets')").css("color", "#666");
		$("#existingSubsets").append(
                "<div style='margin: 3px; margin-bottom: 5px'>" +
                "<div><span resource='"+ subsetURI + "' class='ibtn' title='Remove this subset'>-</span></div> " + 
                "<div><span class='subsetName'>" + subsetName + "</span></div> " + 
                "<div><span class='subsetNSURI'>" + subsetNSURI + "</span></div>" +
                "</div>");
        $("#existingSubsets").show("normal");
        subsetIds.push(subsetURI);
        //Hide the subset editing pane
        $("#doForgetSubset").trigger('click');
        createVoID();
	});
	
	// Remove subset details
	$("#existingSubsets span.ibtn").live("click", function() {
		var selectedURI = $(this).attr("resource");
		$("#existingSubsets div span[resource='"+selectedURI+"']").parent().parent().remove();
		subsetIds.splice( $.inArray(selectedURI, subsetIds), 1);
		if (subsetIds.length == 0) {
			$("#existingSubsets").hide("normal");
			$("div:contains('Provided Subsets')").css("color", "#3f3f3f");
		}
		createVoID();
	});
	
	//////////////////////
	// handle vocabularies
	
	$(".dsVocURI .btn").live("click", function() {
		var vocPrefixInputID = $(this).parent().attr('id');
		lookupVoc(vocPrefixInputID);
	});
	
	$("#doAddDSVocURI").click(function () {
		$("#dsVocURIs").append("<div class='dsVocURI' id='dsVocURI"+ 
				dsVocURICounter +"'><input type='text' size='35' " +
						"value='http://purl.org/dc/terms/' class='dsVocURIVal' /> " +
						"<span class='ibtn' title='Remove this vocabulary'>-</span> " +
						"<span class='btn'>lookup</span></div>");
		dsVocURICounter++;
	});
	
	$(".dsVocURI .ibtn").live("click", function() {
		var vocURI = $(this).parent().attr('id');
		$("#"+vocURI).remove();
	});
			
	////////
	// notes
	$(".ui-icon-help").click(function () {
		var helpID = $(this).attr('id');
		$("#"+helpID+"content").slideToggle("normal");
	});

});