function check_if_installed(){


var request = navigator.mozApps.checkInstalled(manifest_url);
request.onerror = function(e) {
  alert("Error calling checkInstalled: " + request.error.name);
};
request.onsuccess = function(e) {
  if (request.result) {
    alert("App is installed!");
  }
  else {
	
	var request = navigator.mozApps.install(manifest_url);
	request.onsuccess = function () {
	  // Save the App object that is returned
	  var appRecord = this.result;
	  alert('Installation successful!');
	};
	request.onerror = function () {
	  // Display the error information from the DOMError object
	  alert('Install failed, error: ' + this.error.name);
	};
	
  }
};

}

function check_if_firefox(){
pulisci();
/*
if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){ //test for Firefox/x.x or Firefox x.x (ignoring remaining digits);
  
  document.getElementById('installa').style.visibility = "visible";
} else {
document.getElementById('installa').style.visibility = "hidden";
} */
}


function inizio2(){
check_if_firefox();
// 2. posizione
document.getElementById('menu_log').innerHTML = 'Imposto la posizione...';
individua_posizione(); // ha già dentro calcola_distanza

}

// INIZIALIZE
function initialize() {
//alert('initialize');
	geocoder = new google.maps.Geocoder();
	directionsDisplay = new google.maps.DirectionsRenderer();
	//var center = new google.maps.LatLng(45.464217,9.190491);
	var mapOptions = {
		center: markerHere.position,
		zoom: 15,
		minZoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false,
		panControl: false,
		zoomControl: true,
		zoomControlOptions: {
							style: google.maps.ZoomControlStyle.DEFAULT,
							position: google.maps.ControlPosition.RIGHT_CENTER
							},
		scaleControl: false,
		streetViewControl: false
	};
	
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	markerHere.setMap(map);
	
/*		  
	infowindow = new google.maps.InfoWindow({
		content: 'ohiohi',
		maxWidth: 200
	});
*/
	
	//AUTOCOMPLETE START
	var input = /** @type {HTMLInputElement} */(document.getElementById('address'));
	var autocomplete = new google.maps.places.Autocomplete(input);
	//autocomplete.bindTo('bounds', map);
	//AUTOCOMPLETE END

	//  autocomplete per ricerca
	var input2 = /** @type {HTMLInputElement} */(document.getElementById('altro'));
	var autocomplete = new google.maps.places.Autocomplete(input2);

	
	travelmode = google.maps.DirectionsTravelMode.DRIVING;


	// Create a <script> tag and set the USGS URL as the source.
	var script = document.createElement('script');
	// (In this example we use a locally stored copy instead.)
	 //script.src = 'http://earthquake.usgs.gov/earthquakes/feed/geojsonp/2.5/week';
	script.src = 'data/data.js';
	document.getElementsByTagName('head')[0].appendChild(script);
	
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('percorso'));	

	inizio2();
	}
// FINE INITIALIZE

function codeAddress() {
	document.getElementById("posizione").style.display = 'none';
	var address = document.getElementById('address').value;

  //alert(address);
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
		posHere = results[0].geometry.location;
		aggiorna_posizione();
		// aggiustare: se c'era percorso, ricalcolare, ecc
		showOverlays();
    } else {
		//alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function calcola_percorso() {
	nascondi_div();
	var start = posHere;
	var end = destination;
	var request = {
		origin:start,
		destination:end,
		travelMode: travelmode// google.maps.DirectionsTravelMode.DRIVING
	};
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
		destinazione_scelta = true;
		document.getElementById('menu_percorso').style.display = 'inline';
		directionsDisplay.setDirections(response);
		} else { alert('noooo'); }
	});
}

function change_mode(mode){
	travelmode = mode;
	switch(mode){
	case google.maps.DirectionsTravelMode.DRIVING:
		document.getElementById('mode').src = "img/car_b.png";
		break;
	case google.maps.DirectionsTravelMode.WALKING:
		document.getElementById('mode').src = "img/ped_b.png";
		break;
	case google.maps.DirectionsTravelMode.TRANSIT:
		document.getElementById('mode').src = "img/bus_b.png";
		break;		
	}
	
	
	document.getElementById("travelmode").style = "display:none";
	if(destinazione_scelta){
		calcola_percorso();
	}
}

function aggiorna_posizione() {
	document.getElementById('menu_log').style.display = 'none';
	document.getElementById('menu_standard').style.display = 'block';
	
	markerHere.setPosition(posHere);
	map.setCenter(posHere);
	//circle.setPosition(posHere);
	//circle.setMap(map);	
	calcola_distanza();
	if(destinazione_scelta){
		calcola_percorso();
	}
	clearOverlays();
	showOverlays();
}

function individua_posizione() {
//document.getElementById("info").style.display = 'none';
  // Try HTML5 geolocation 
  if(navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(geolocation,errorGettingPosition,{timeout:10000});
  //alert('geolocation');
  } else {
    // Browser doesn't support Geolocation
		alert('Error: Your browser doesn\'t support geolocation.');
		document.getElementById("posizione").style = "display:block";
		//document.getElementById("pos_manuale").value = "on";
		//wait_for_distances = true;
  }
	//mostra_gruppi(); 
}

function geolocation(position){
	//alert('position');
	posHere = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	//alert('posizione aggiornata');
	markerHere.setPosition(posHere);
	wait_for_distances += 1;	
	markerHere.setMap(map);
	map.setCenter(posHere);	
	//circle.setPosition(posHere);
	//circle.setMap(map);
	
	//mostra_gruppi();
	document.getElementById('menu_log').style.display = 'none';
	document.getElementById('menu_standard').style.display = 'block';
	document.getElementById('posizione').style.display = 'none';
	calcola_distanza();
	if (destinazione_scelta){
		calcola_percorso();
		}
	clearOverlays();
	showOverlays();	
}

function errorGettingPosition(err){
alert('Rilevamento automatico della posizione non funzionante');
	document.getElementById('menu_log').innerHTML = 'Imposta la posizione manualmente';
	mostra_posizione();
}

function drag_marker(){
	document.getElementById('menu_log').style.display = 'block';
	document.getElementById('menu_standard').style.display = 'none';
	document.getElementById('menu_log').innerHTML = 'Muovi manualmante la posizione sulla mappa <input onclick="drag_marker_stop()" type="button" value="FINITO">';
	document.getElementById("posizione").style.display = 'none';
	//document.getElementById("map-canvas").style.display = 'block';
	markerHere.setDraggable(true);
	//posHere = new google.maps.LatLng(45.464217,9.190491);
	//markerHer.setPosition(posHere);
	//map.setCenter(posHere);
}

function drag_marker_stop(){
	document.getElementById('menu_log').style.display = 'none';
	document.getElementById('menu_standard').style.display = 'block';
	markerHere.setDraggable(false);
	posHere = markerHere.position;
	map.setCenter(posHere);
	calcola_distanza();
	if(destinazione_scelta){
		calcola_percorso();
	}
	clearOverlays();
	showOverlays();
}

function rad(x) {
	return x*Math.PI/180;
}

function calcola_distanza(){
//alert(wait_for_distances);
	if(wait_for_distances>1)
	{
		//alert('calcola_distanza');
		var lat1 = markerHere.position.lat();
		var lon1 = markerHere.position.lng();

		for (var i = 0; i < markersArray.length; i++) {
			var lat2 = markersArray[i].position.lat();
			var lon2 = markersArray[i].position.lng();
				
			var R = 6371.0090667; // km
			var dLat  = rad( lat2 - lat1 );
			var dLong = rad( lon2 - lon1 );

			var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var dist = R * c * 1000;
			//var testo = lat1 + ", " + lon1+"\n"+lat2+", "+lon2+"\ndist: "+dist;
			//alert(testo);
			markersArray[i].distanza = dist;
			markersArray[i].setTitle(markersArray[i].title + "\na metri " + Math.round(dist,0));
		}
	distances_ok = true;	
	}
}

function cerca_altro(){
	document.getElementById("gruppi").style.display = 'none';
	var address = document.getElementById('altro').value;
  //alert(address);
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
		//alert('ok');
			for (var i = 0; i < results.length; i++) {
				var marker = new google.maps.Marker({
				  position: results[i].geometry.location,
				  map: null,
				  content: 'altro',
				  title: address,
				  distanza: '',
				  dettagli: {'INFO': results[i].formatted_address}
				});
				google.maps.event.addListener(marker, 'click', function() { info(this);});
				markersArray.push(marker);
				calcola_distanza();
			}
			selectedGruppo.push('altro')
			showOverlays();
    } else {
		//alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

// Removes the overlays from the map, but keeps them in the array
function clearOverlays() {
	if (markersArray) {
		for (i in markersArray) {
			markersArray[i].setMap(null);
			destinazione_scelta = false;
		}
	}
}

// Shows any overlays currently in the array
function showOverlays() {
//alert(distances_ok);
	if (selectedGruppo.length>0){
		for (g in selectedGruppo){
			if (markersArray.length>0) {
				if(distances_ok){
					for (i in markersArray) {
						if(markersArray[i].content == selectedGruppo[g]){
							//alert(markersArray[i].distanza);
							if(markersArray[i].distanza <= DistanzaImpostata) {
								markersArray[i].setIcon(ico_image[gruppi[selectedGruppo[g]]]['yes']);
								} else {
								markersArray[i].setIcon(ico_image[gruppi[selectedGruppo[g]]]['no']);
								}
							markersArray[i].setMap(map);
						}
					}
				} else {
					calcola_distanza()
					showOverlays()
				}
			}
		}
		//document.getElementById('info').style.display = 'none';
	}
}


function AddToSelectedGruppo(gruppo){
cbObj = document.getElementById(gruppo);
    if(cbObj.checked)
	{
	selectedGruppo.push(gruppo); //inserisce in array
	}
	else{
	var a = selectedGruppo.indexOf(gruppo); 
	selectedGruppo.splice(a,1); // rimuove da array 
	}
//	alert(selectedGruppo[0]);
	clearOverlays();
	showOverlays();
	markerCliccato.setMap(null);
	markerCliccato.ok = false;
}

function mostra(id){
var infotext = '<div id="draggable"><p align="right"><input type="button" value="x" onclick="nascondi_div()"></p></div>';
	var DivObj = document.getElementById('info');
/*	if(DivObj.style.display == "block"){
		DivObj.style.display = "none";
	} else {
	*/
		DivObj.innerHTML = infotext + document.getElementById(id).innerHTML;
		DivObj.style.display = 'block';
	//}
}

function nascondi_div(){
	document.getElementById('gruppi').style.display = 'none';
	document.getElementById('travelmode').style.display = 'none';
	document.getElementById('posizione').style.display = 'none';
	document.getElementById('percorso').style.display = 'none';
	document.getElementById('distanza').style.display = 'none';
	document.getElementById('dettagli').style.display = 'none';
	document.getElementById("info").style = "display:none";
	document.getElementById('menu_log').style.display = 'none';
	document.getElementById('menu_standard').style.display = 'block';
	if (markerCliccato.ok){
		document.getElementById('menu_dettagli').style.display = 'inline';
	} else {
		document.getElementById('menu_dettagli').style.display = 'none';
	}
	if (destinazione_scelta){
		document.getElementById('menu_percorso').style.display = 'inline';
	} else {
		document.getElementById('menu_percorso').style.display = 'none';
	}
}

function mostra_gruppi(){
	nascondi_div()
	document.getElementById('menu_log').innerHTML = 'Seleziona i servizi da visualizzare <button onclick="nascondi_div()">FINITO</button>';
	document.getElementById('menu_log').style.display = 'block';
	document.getElementById('menu_standard').style.display = 'none';
	document.getElementById('gruppi').style.display = 'block';
}

function mostra_travelmode(){
	nascondi_div()
	document.getElementById('menu_log').innerHTML = 'Imposta il modo di viaggio <button onclick="nascondi_div()">FINITO</button>';
	document.getElementById('menu_log').style.display = 'block';
	document.getElementById('menu_standard').style.display = 'none';
	document.getElementById('travelmode').style.display = 'block';
}

function mostra_posizione(){
	nascondi_div()
	document.getElementById('menu_log').innerHTML = 'Imposta la posizione <button onclick="nascondi_div()">FINITO</button>';
	document.getElementById('menu_log').style.display = 'block';
	document.getElementById('menu_standard').style.display = 'none';
	document.getElementById('posizione').style.display = 'block';
}

function mostra_percorso(){
	nascondi_div()
	document.getElementById('menu_log').innerHTML = 'Indicazioni stradali <button onclick="nascondi_div()">FINITO</button>';
	document.getElementById('menu_log').style.display = 'block';
	document.getElementById('menu_standard').style.display = 'none';
	document.getElementById('percorso').style.display = 'block';
}

function mostra_distanza(){
	nascondi_div()
	document.getElementById('menu_log').innerHTML = 'Imposta il raggio di ricerca <button onclick="accetta()">OK</button>';
	document.getElementById('menu_log').style.display = 'block';
	document.getElementById('menu_standard').style.display = 'none';
	document.getElementById('distanza').style.display = 'block';
}

function mostra_dettagli(){
	nascondi_div()
	document.getElementById('menu_log').innerHTML = 'Informazioni <button onclick="nascondi_div()">FINITO</button>';
	document.getElementById('menu_log').style.display = 'block';
	document.getElementById('menu_standard').style.display = 'none';
	document.getElementById('dettagli').style.display = 'block';
}

function accetta(){
	DistanzaImpostata = distance;
	//alert(DistanzaImpostata);
	clearOverlays();
	showOverlays();
	document.getElementById("distanza_menu").value = document.getElementById("meter").value;
	document.getElementById("distanza").style.display = "none";
	nascondi_div();
}

function formatta(val){
	if(val >= 1000){
	result = val/1000 + " km"
	} else {
	result = val + " m"
	}
	return result
}



function info(marker){

destination = marker.position;
//alert(destination);
var dati = marker.dettagli;
var dettagli = '<div style="float:right;"><m><img src="img/move.png" width="20px" height="20px"></m></div>';

var arrayDettagli = [];

for (k in dati){

	switch(k){
	case 'DENOMINAZ':
		arrayDettagli.splice(0,0,'<span class="DENOMINAZ">'+ dati[k] + '</span>');
		break;
	case 'INDIRIZZO':
		arrayDettagli.splice(1,0,'<span class="value">' + dati[k] + '</span>');
		break;
	case 'TELEFONO':
		arrayDettagli.splice(2,0,'<span class="value"><a href="tel:' + dati[k] + '">' + dati[k] + '</a></span>');
		break;
	case 'help_mi':
		break;
	case 'scadenza':
		break;
	default:
		arrayDettagli.push('<span class="key">'+ k + '</span>: <span class="value">' + dati[k] + '</span>');
	}
}
arrayDettagli.splice(1,0,'a metri ' + Math.round(marker.distanza,0) + '<br>');
arrayDettagli.push('<span class="key">scadenza</span>: <span class="value">' + dati['scadenza'] + '</span>');
dettagli += arrayDettagli.join('<br>');
dettagli += '<br><input type="button" value="calcola percorso" style="width:250px; heigth:100px;" onclick="calcola_percorso();">';
document.getElementById("dettagli").innerHTML = dettagli;
//infotext = dettagli + '<br><input type="button" value="calcola percorso" style="width:250px; heigth:100px;" onclick="calcola_percorso();">';
//infotext += '<br><input type="button" value="chiama" onclick="make_a_call();">';
//document.getElementById("info").innerHTML = infotext;
}	  

function pulisci(){
	markerCliccato.ok = false;
	//markerCliccato.setMap(null);
	document.getElementById('menu_dettagli').style.display = 'none';
	destinazione_scelta = false;
	//destination = null;
	//calcola_percorso();
	document.getElementById('menu_percorso').style.display = 'none';
	//map.setCenter(markerHere);
	clearOverlays();
	for (g in gruppi){
		document.getElementById(g).checked = false;
		var a = selectedGruppo.indexOf(g); 
		selectedGruppo.splice(a,1); // rimuove da array 
	}
}

function make_a_call(){
// Telephony object
var tel = navigator.mozTelephony;

// Check if the phone is muted (read/write property)
console.log(tel.muted);

// Check if the speaker is enabled (read/write property)
console.log(tel.speakerEnabled);

// Place a call
var call = tel.dial("0236580497");
}

