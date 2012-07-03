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
var voiDURIsList = new Array();
var today = new Date();

// UI helper methods

function initUI(){
	$("a[href='ref1']").attr("href", vgBase + vgREFGeneral_Dataset_Metadata);
	$("a[href='ref2']").attr("href", vgBase + vgREFCategorize_Datasets);
	$("a[href='ref3']").attr("href", vgBase + vgREFDescribing_Dataset_Interlink);
	$("a[href='ref4']").attr("href", vgBase + vgREFAnnouncing_the_license_of);
	$("a[href='ref5']").attr("href", vgBase + vgREFVocabularies_used);
	$("a[href='ref6']").attr("href", vgBase + vgREFSPARQL_endpoint_and_Examp);
	$("a[href='ref7']").attr("href", voidSpecBase + voidSpecREFVoID_Metadata);	
	
	$("#voidCreatedOn").datepicker("setDate", today);
	$("#provAccessedOn").datepicker("setDate", today);
	createVoID();
}

function clearTopics(){
	$("#dsTopicOut").hide("fast");
	$("#dsTopicOut").html("");
	$("#dsTopic").val("");
}

function setStatus(status){
	$("#status").text(status);
	$("#status").fadeIn(1000);
}

// jQuery main interaction code
$(function(){

	$("#voidCreatedOn").datepicker({
		dateFormat: "yy-mm-dd",
		maxDate: today
	});
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
		//Validate on section change
		change: function(event, ui) {
			validateSection(ui.oldHeader[0].id);
			createVoID();
		}
	 });
	
	// general buttons
	$("#doStart").click(function () {
		$("#intro").fadeOut("slow");
	});
	
	$("#doAbout").click(function () {
		$("#about").slideToggle("normal");
	});
	
	$("#doCreate").click(function () {
		validateData();
		createVoiD();
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
	
	//////////////////////
	// handle example URIs
	$(".dsExampleURI .btn").live("click", function() {
		var exURI = $(this).parent().attr('id');
		validateURI($("#"+exURI+" input").val());
	});
	
	$("#doAddDSExampleURI").click(function () {
		$("#dsExampleURIs").append("<div class='dsExampleURI' id='dsExampleURI"+ dsExampleURICounter +"'><input type='text' size='35' value='http://example.org/resource/ex' class='dsExampleURIVal' /> <span class='ibtn' title='Remove this example resource'>-</span> <span class='btn'>validate</span></div>");
		dsExampleURICounter++;
	});
	
	$(".dsExampleURI .ibtn").live("click", function() {
		var exURI = $(this).parent().attr('id');
		$("#"+exURI).remove();
	});
	
	/////////////////////////////////
	// handle dataset topic selection
		
	// add a topic
	$(".topicopt span").live("click", function() {
		var selectedURI = $(this).attr("resource");
		var label = $(this).attr("content");
		$("#dsSelectedTopics").append(
			"<div style='margin: 3px'><a href='"+ selectedURI +"' target=\"_blank\">" + label + "</a> " +
			" <span resource='"+ selectedURI + "' class='ibtn' title='Remove this topic'>-</span>" + 
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
			$("div:contains('Provided Dataset Topics')").css("color", "white");
		}
	});

	//////////////////////
	// handle vocabularies
	
	$(".dsVocURI .btn").live("click", function() {
		var vocPrefixInputID = $(this).parent().attr('id');
		lookupVoc(vocPrefixInputID);
	});
	
	$("#doAddDSVocURI").click(function () {
		$("#dsVocURIs").append("<div class='dsVocURI' id='dsVocURI"+ dsVocURICounter +"'><input type='text' size='35' value='http://purl.org/dc/terms/' class='dsVocURIVal' /> <span class='ibtn' title='Remove this vocabulary'>-</span> <span class='btn'>lookup</span></div>");
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