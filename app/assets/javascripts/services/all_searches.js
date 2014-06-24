//= require services/type_alma/input_validation
//= require services/type_alma/display_form_input
//= require services/type_alma/multiselect_dropdown


var isTooLtipaCtivated = false; /* var to know if the user activate tooltip */
var isStateInfoActivated = true; /* var to know if the user activate state info */
var delayTime = 300; /* delay time to slide down all the form controls */

$(document).ready(function () {	
	/* hide all the form controls by default */
	$(".tab-v2").css('position', 'absolute').css("width", 1019); /* sol to resizing form */
	$table_query = $("table#table_query");
	$groups = $table_query.find(".group");

	$container_input = $groups.find(".container-input");	
	$container_input.hide();

	$select_multiple = $groups.find("select[multiple='multiple']");
	$select_multiple.each(function (event) {
		$(this).hide();
	});
		
	/* control form #search_radius with text by default */
	$search_radius = $groups.find("#search_radius");
	$search_radius.val('0:10:00').closest(".container-input").slideDown();


	$table_query.find("#flag").click(function (event) {
		(isTooLtipaCtivated) ? isTooLtipaCtivated = false: isTooLtipaCtivated = true;
		var $divColor = $(this).children().first();
		(isTooLtipaCtivated) ? $divColor.addClass("icon-color-blue"): $divColor.removeClass("icon-color-blue");
	}).children().first().css("border", "none")	;

	$actions_state = $("#actions_states");
	$table_query.find("#info_states").click(function (event) {
		(isStateInfoActivated) ? isStateInfoActivated = false: isStateInfoActivated = true;
		var $divColor = $(this).children().first();
		(isStateInfoActivated) ? $divColor.addClass("icon-color-blue"): $divColor.removeClass("icon-color-blue");
		
		$actions_state.slideToggle("fast");
	}).children().first().css("border", "none").addClass("icon-color-blue");
 	
 	/* listener for class name group */
	$groups.on({
		mouseenter: showFormInputs,
		mouseleave: hideFormInputs
	});
	$multiselect_class = $groups.find("div[class|='multiselect']");
	$checkboxes_multiple_select = $multiselect_class.children("div").children("ul").find("input:checkbox");
	$checkboxes_multiple_select.on({change: multiselect});

	/* available only for display */
	var boxes_estate = {"#position":true, "#energy":false, "#time":false, "#polarisation":false,
						"#observation":false, "#project":false, "#empty_td":false, "#options":false}
	$.each(boxes_estate, function (k, v) {
		if (!v){
			$td = $table_query.find(k)
			$td.css('background-color', '#FDFDFD');
			$td.find('label').css('color', '#D5D5D5');
			$td.find('h2').css('color', '#C2C2C2');	
		}		
	});
	
	/* by default Observe target on the multiselect is selected 
	$("table#table_query").find(".multiselect-scan-intent")
 		.children("div").children("ul").children("li").find("#observe_target")
 		.click();
	*/
 	$table_query.find("button[type='reset']").click(function (event) {
 		
 		$container_input.find(".form-control").val("");
 		$select_multiple.children().attr("selected", false);

 		$checkboxes_multiple_select.prop("checked", false);
			
		$multiselect_class.clearQueue().finish()
			.slideUp("fast").find("button").clearQueue().finish()
			.slideUp("fast").children("span").remove();
 	});

 	/* listener to dropdown-header class of the multiselect ul to click at the determinated checkbox */
	$multiselect_class.find(".multiselect-scan-intent").children("div").children("ul")
		.find(".dropdown-header").on({
		click: function (event) {
			$this = $(this);
			if ($this.text()=='Science'){
				$this.closest("ul").find("#observe_target").click();
			}
			else if ($this.text()=='Standar Calibration'){
				var amount_checked = 0;
				var amount_checkboxs = 0
				$this.closest("ul").find("#amplitude, #bandpass, #phase, #pointing")
					.map(function (event) {						
						amount_checkboxs += 1;
						if ($this.is(':checked')){
							amount_checked += 1;
						}
						else{
							$this.click();
						}
					});
				if (amount_checked == amount_checkboxs){
					$this.closest("ul").find("#amplitude, #bandpass, #phase, #pointing")
						.click();
				}
			}
		}
	});

	$sesame_search_button = $groups.find("#sesame_search");
	$ra_dec = $groups.find("#ra_dec");
	$source_name_sesame = $groups.find("#source_name_sesame");
	/* change the sumbit button to just resolve sesame */
 	$source_name_sesame.keypress(function (event) {
 		if (event.keyCode==13) {
    		$sesame_search_button.click();
    	}
    	else {
    		$ra_dec.val("").closest(".container-input").slideUp();
    	}
 	});

 	function update_action_state (add_class, strong, text) {
 		$actions_state.removeClass("alert-warning alert-success alert-danger alert-info")
 				.addClass(add_class).text("")
 				.append("<strong></strong> " + text)
 				.find("strong").text(strong);
 	}

 	$queryListTable = $("#query_list_table");
 	/* when is needed sesame resolver */
 	$sesame_search_button.on('click', function (event) {
 		$this = $(this);
 		if (!$source_name_sesame.val()){ /*if is empty cancel the submit*/
 						
 			$ra_dec.val("").closest(".container-input").slideUp();
 			event.preventDefault(); /* cancel submit */
 			return false;
 		}
 		var isAdded = false;
 		$queryListTable.find("td").each(function (event) {
 			if($(this).text() == $source_name_sesame.val()){
 				isAdded = true;
 			}
 		});
 		if (isAdded){
 			update_action_state("alert-danger","Oh snap!", "the sesame name source is added");
			event.preventDefault(); /* cancel submit */
 			return false;
 		}
 		/* change the icon */
 		$this.find("i").removeClass("fa fa-angle-right fa-lg").addClass("fa fa-spinner fa-spin"); 
 		$source_name_sesame.css('width', "144px");
 	});
	
	$position = $table_query.find("#position");
	$plus_position_button = $position.find("#plus_position");

 	$position.on({
		mouseenter: function (event) {
			$this = $(this);
			$plus_position_button.parent().clearQueue().finish()
					.delay(delayTime).show("slow");
		},
		mouseleave: function (event) {
			$plus_position_button.parent().clearQueue().finish().hide();
		}
	});
 	
	$plus_position_button.on('click', function (event) {
		if (!$ra_dec.val()) {
			update_action_state("alert-danger","Oh snap!", "cordinates not added to the query list by empty RA Dec field");
			event.preventDefault(); /* cancel submit */
			return false;
		}
		else if (!$search_radius.val()){
			update_action_state("alert-danger","Oh snap!", "cordinates not added to the query list by empty Search Radius field");
			event.preventDefault(); /* cancel submit */
			return false;
		}
		
	});

});
	
		
	